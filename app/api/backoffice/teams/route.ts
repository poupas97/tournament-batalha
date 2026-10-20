import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MAX_NAME_LENGTH } from "@/constants/validation";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import { CompetitionStatus } from "@/generated/prisma";
import { isPhotoUrl, sanitizePlayers, sanitizeStaffs } from "@/lib/staff";
import { deletePersonPhoto, uploadPersonPhoto } from "@/lib/personPhotoService";
import {
  createdResponse,
  getResponse,
  invalidParam,
  requireToken,
  unauthorized,
} from "@/lib/api";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const teams = await prisma.team.findMany({
    orderBy: [{ name: "asc" }, { competition: { name: "asc" } }],
    include: {
      competition: true,
      _count: {
        select: { players: true, staffs: true },
      },
    },
  });

  return getResponse(teams);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name);
  const competitionId = sanitizeNumber(body?.competitionId);
  const players = sanitizePlayers(body?.players);
  const staffs = sanitizeStaffs(body?.staffs);

  if (!name || name.length > MAX_NAME_LENGTH) {
    return invalidParam("Name");
  }

  if (!competitionId) {
    return invalidParam("Competition");
  }

  if (players === null) {
    return invalidParam("Players");
  }

  if (staffs === null) {
    return invalidParam("Staffs");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { id: true, status: true },
  });

  if (!competition) {
    return invalidParam("Competition");
  }

  if (competition.status !== CompetitionStatus.DRAFT) {
    return invalidParam("CompetitionStatus");
  }

  const uploadedKeys: string[] = [];

  try {
    const team = await prisma.$transaction(
      async (tx) => {
        const createdTeam = await tx.team.create({
          data: {
            name,
            competitionId,
            players: players?.length
              ? {
                  create: players.map(({ name, number, photo }) => ({
                    name,
                    number,
                    photo: isPhotoUrl(photo) ? photo : null,
                  })),
                }
              : undefined,
            staffs: staffs?.length
              ? {
                  create: staffs.map(({ name, photo }) => ({
                    name,
                    photo: isPhotoUrl(photo) ? photo : null,
                  })),
                }
              : undefined,
          },
          include: {
            players: { orderBy: { id: "asc" } },
            staffs: { orderBy: { id: "asc" } },
          },
        });

        const savedPlayers = [];

        for (const [index, player] of createdTeam.players.entries()) {
          const photo = players?.[index]?.photo;

          if (!photo || isPhotoUrl(photo)) {
            savedPlayers.push(player);
            continue;
          }

          const uploaded = await uploadPersonPhoto(
            "player",
            player.id,
            photo,
            (key) => uploadedKeys.push(key),
          );

          savedPlayers.push(
            await tx.player.update({
              where: { id: player.id },
              data: { photo: uploaded.url },
            }),
          );
        }

        const savedStaffs = [];
        for (const [index, staff] of createdTeam.staffs.entries()) {
          const photo = staffs?.[index]?.photo;

          if (!photo || isPhotoUrl(photo)) {
            savedStaffs.push(staff);
            continue;
          }

          const uploaded = await uploadPersonPhoto(
            "staff",
            staff.id,
            photo,
            (key) => uploadedKeys.push(key),
          );

          savedStaffs.push(
            await tx.staff.update({
              where: { id: staff.id },
              data: { photo: uploaded.url },
            }),
          );
        }

        return { ...createdTeam, players: savedPlayers, staffs: savedStaffs };
      },
      { timeout: 60_000 },
    );

    return createdResponse(team);
  } catch {
    await Promise.allSettled(uploadedKeys.map(deletePersonPhoto));

    return NextResponse.json(
      { error: "Não foi possível criar a equipa e guardar as fotos" },
      { status: 502 },
    );
  }
}
