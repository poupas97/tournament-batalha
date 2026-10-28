import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  MAX_NAME_LENGTH,
  TEAM_POT_MAX,
  TEAM_POT_MIN,
} from "@/constants/validation";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import { CompetitionStatus } from "@/generated/prisma";
import { isPhotoUrl, sanitizePlayers, sanitizeStaffs } from "@/lib/staff";
import { isValidPhotoValue } from "@/lib/photo";
import { getRandomSuffix } from "@/lib/random";
import { deletePhoto, uploadPhoto } from "@/lib/objectStorage";
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
  const pot = sanitizeNumber(body?.pot ?? 1);
  const competitionId = sanitizeNumber(body?.competitionId);
  const players = sanitizePlayers(body?.players);
  const staffs = sanitizeStaffs(body?.staffs);
  const photo = body?.photo === undefined ? null : body.photo;

  if (!name || name.length > MAX_NAME_LENGTH) {
    return invalidParam("Name", "name");
  }

  if (!pot || pot < TEAM_POT_MIN || pot > TEAM_POT_MAX) {
    return invalidParam("Pot", "pot");
  }

  if (!competitionId) {
    return invalidParam("Competition", "competitionId");
  }

  if (players === null) {
    return invalidParam("Players", "players");
  }

  if (staffs === null) {
    return invalidParam("Staffs", "staffs");
  }

  if (!isValidPhotoValue(photo)) {
    return invalidParam("Photo", "photo");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { id: true, status: true },
  });

  if (!competition) {
    return invalidParam("Competition", "competitionId");
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
            pot,
            photo: isPhotoUrl(photo) ? photo : null,
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

        let savedTeamPhoto = createdTeam.photo;
        if (photo && !isPhotoUrl(photo)) {
          const key = `team/${createdTeam.id}/${getRandomSuffix()}`;
          uploadedKeys.push(key);
          const savedPhoto = await uploadPhoto(key, photo);
          await tx.team.update({
            where: { id: createdTeam.id },
            data: { photo: savedPhoto },
          });
          savedTeamPhoto = savedPhoto;
        }

        const savedPlayers = [];

        for (const [index, player] of createdTeam.players.entries()) {
          const photo = players?.[index]?.photo;

          if (!photo || isPhotoUrl(photo)) {
            savedPlayers.push(player);
            continue;
          }

          const key = `player/${player.id}/${getRandomSuffix()}`;
          uploadedKeys.push(key);
          const savedPhoto = await uploadPhoto(key, photo);

          savedPlayers.push(
            await tx.player.update({
              where: { id: player.id },
              data: { photo: savedPhoto },
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

          const key = `staff/${staff.id}/${getRandomSuffix()}`;
          uploadedKeys.push(key);
          const savedPhoto = await uploadPhoto(key, photo);

          savedStaffs.push(
            await tx.staff.update({
              where: { id: staff.id },
              data: { photo: savedPhoto },
            }),
          );
        }

        return {
          ...createdTeam,
          photo: savedTeamPhoto,
          players: savedPlayers,
          staffs: savedStaffs,
        };
      },
      { timeout: 60_000 },
    );

    return createdResponse(team);
  } catch {
    await Promise.allSettled(uploadedKeys.map(deletePhoto));

    return NextResponse.json(
      {
        error: "Não foi possível criar a equipa e guardar as fotos",
        key: "photo",
      },
      { status: 502 },
    );
  }
}
