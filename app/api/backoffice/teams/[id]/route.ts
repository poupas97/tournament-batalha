import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MAX_NAME_LENGTH } from "@/constants/validation";
import { CompetitionStatus } from "@/generated/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { isPhotoUrl, sanitizePlayers, sanitizeStaffs } from "@/lib/staff";
import { deletePersonPhoto, uploadPersonPhoto } from "@/lib/personPhotoService";
import { RouteContext } from "@/types/api";
import {
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
  updatedResponse,
} from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const teamId = await getParamId(context);
  if (!teamId) {
    return invalidParam("Team");
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      competition: true,
      players: {
        orderBy: { createdAt: "asc" },
      },
      staffs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!team) {
    return noFound("Team");
  }

  return getResponse(team);
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const teamId = await getParamId(context);
  if (!teamId) {
    return invalidParam("Team");
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name);
  const players = sanitizePlayers(body?.players);
  const staffs = sanitizeStaffs(body?.staffs);

  if (!name || name.length > MAX_NAME_LENGTH) {
    return invalidParam("Name");
  }

  if (players === null) {
    return invalidParam("Players");
  }

  if (staffs === null) {
    return invalidParam("Staffs");
  }

  const existing = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, competition: { select: { status: true } } },
  });

  if (!existing) {
    return noFound("Team");
  }

  if (existing.competition.status !== CompetitionStatus.DRAFT) {
    return invalidParam("CompetitionStatus");
  }

  const uploadedKeys: string[] = [];
  try {
    const teamUpdated = await prisma.$transaction(
      async (tx) => {
        const currentPlayers = await tx.player.findMany({
          where: { teamId },
          select: { id: true },
        });

        const currentStaffs = await tx.staff.findMany({
          where: { teamId },
          select: { id: true },
        });

        const playerIds: number[] = [];
        const staffIds: number[] = [];
        const updatedPlayers = [];
        const updatedStaffs = [];

        for (const player of players ?? []) {
          const existingPlayerId =
            player.id && currentPlayers.some(({ id }) => id === player.id)
              ? player.id
              : undefined;

          let saved = existingPlayerId
            ? await tx.player.update({
                where: { id: existingPlayerId },
                data: {
                  name: player.name,
                  number: player.number,
                  photo: isPhotoUrl(player.photo) ? player.photo : null,
                },
              })
            : await tx.player.create({
                data: {
                  teamId,
                  name: player.name,
                  number: player.number,
                  photo: isPhotoUrl(player.photo) ? player.photo : null,
                },
              });

          if (player.photo && !isPhotoUrl(player.photo)) {
            const uploaded = await uploadPersonPhoto(
              "player",
              saved.id,
              player.photo,
              (key) => uploadedKeys.push(key),
            );
            saved = await tx.player.update({
              where: { id: saved.id },
              data: { photo: uploaded.url },
            });
          }

          playerIds.push(saved.id);
          updatedPlayers.push(saved);
        }

        for (const staff of staffs ?? []) {
          const existingStaffId =
            staff.id && currentStaffs.some(({ id }) => id === staff.id)
              ? staff.id
              : undefined;

          let saved = existingStaffId
            ? await tx.staff.update({
                where: { id: existingStaffId },
                data: {
                  name: staff.name,
                  photo: isPhotoUrl(staff.photo) ? staff.photo : null,
                },
              })
            : await tx.staff.create({
                data: {
                  teamId,
                  name: staff.name,
                  photo: isPhotoUrl(staff.photo) ? staff.photo : null,
                },
              });

          if (staff.photo && !isPhotoUrl(staff.photo)) {
            const uploaded = await uploadPersonPhoto(
              "staff",
              saved.id,
              staff.photo,
              (key) => uploadedKeys.push(key),
            );

            saved = await tx.staff.update({
              where: { id: saved.id },
              data: { photo: uploaded.url },
            });
          }

          staffIds.push(saved.id);
          updatedStaffs.push(saved);
        }

        await tx.player.deleteMany({
          where: { teamId, id: { notIn: playerIds } },
        });

        await tx.staff.deleteMany({
          where: { teamId, id: { notIn: staffIds } },
        });

        const updatedTeam = await tx.team.update({
          where: { id: teamId },
          data: { name },
          include: {
            players: { orderBy: { createdAt: "asc" } },
            staffs: { orderBy: { createdAt: "asc" } },
          },
        });

        return updatedTeam;
      },
      { timeout: 60_000 },
    );

    return updatedResponse(teamUpdated);
  } catch {
    await Promise.allSettled(uploadedKeys.map(deletePersonPhoto));

    return NextResponse.json(
      { error: "Não foi possível atualizar a equipa e guardar as fotos" },
      { status: 502 },
    );
  }
}
