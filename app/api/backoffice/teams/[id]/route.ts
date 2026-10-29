import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  MAX_NAME_LENGTH,
  TEAM_POT_MAX,
  TEAM_POT_MIN,
} from "@/constants/validation";
import { AuditAction, CompetitionStatus } from "@/generated/prisma";
import { createAuditLog } from "@/lib/audit";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import { isPhotoUrl, sanitizePlayers, sanitizeStaffs } from "@/lib/staff";
import { isValidPhotoValue } from "@/lib/photo";
import { getRandomSuffix } from "@/lib/random";
import { deletePhoto, uploadPhoto } from "@/lib/objectStorage";
import { RouteContext } from "@/types/api";
import {
  deletedResponse,
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
        orderBy: { name: "asc" },
      },
      staffs: {
        orderBy: { name: "asc" },
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
  const pot = sanitizeNumber(body?.pot ?? 1);
  const players = sanitizePlayers(body?.players);
  const staffs = sanitizeStaffs(body?.staffs);
  const photo = body?.photo === undefined ? null : body.photo;

  if (!name || name.length > MAX_NAME_LENGTH) {
    return invalidParam("Name", "name");
  }

  if (!pot || pot < TEAM_POT_MIN || pot > TEAM_POT_MAX) {
    return invalidParam("Pot", "pot");
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

  const existing = await prisma.team.findUnique({
    where: {
      id: teamId,
      deletedAt: null,
      competition: { deletedAt: null },
    },
    select: {
      id: true,
      competition: { select: { status: true } },
    },
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
        const currentPlayers = await tx.player.findMany({ where: { teamId } });

        const currentStaffs = await tx.staff.findMany({ where: { teamId } });

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
            const key = `player/${saved.id}/${getRandomSuffix()}`;
            uploadedKeys.push(key);
            const savedPhoto = await uploadPhoto(key, player.photo);
            saved = await tx.player.update({
              where: { id: saved.id },
              data: { photo: savedPhoto },
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
            const key = `staff/${saved.id}/${getRandomSuffix()}`;
            uploadedKeys.push(key);
            const savedPhoto = await uploadPhoto(key, staff.photo);

            saved = await tx.staff.update({
              where: { id: saved.id },
              data: { photo: savedPhoto },
            });
          }

          staffIds.push(saved.id);
          updatedStaffs.push(saved);
        }

        for (const removed of currentPlayers.filter(
          ({ id }) => !playerIds.includes(id),
        )) {
          const deleted = await tx.player.delete({ where: { id: removed.id } });

          await createAuditLog(
            {
              token,
              action: AuditAction.DELETE,
              entity: "Player",
              entityId: removed.id,
              before: removed,
              after: deleted,
            },
            tx,
          );
        }

        for (const removed of currentStaffs.filter(
          ({ id }) => !staffIds.includes(id),
        )) {
          const deleted = await tx.staff.delete({ where: { id: removed.id } });

          await createAuditLog(
            {
              token,
              action: AuditAction.DELETE,
              entity: "Staff",
              entityId: removed.id,
              before: removed,
              after: deleted,
            },
            tx,
          );
        }

        const updatedTeam = await tx.team.update({
          where: { id: teamId },
          data: { name, pot, photo: isPhotoUrl(photo) ? photo : null },
          include: {
            players: { orderBy: { createdAt: "asc" } },
            staffs: { orderBy: { createdAt: "asc" } },
          },
        });

        if (!photo || isPhotoUrl(photo)) return updatedTeam;

        const key = `team/${updatedTeam.id}/${getRandomSuffix()}`;
        uploadedKeys.push(key);
        const savedPhoto = await uploadPhoto(key, photo);

        return tx.team.update({
          where: { id: teamId },
          data: { photo: savedPhoto },
          include: {
            players: { orderBy: { createdAt: "asc" } },
            staffs: { orderBy: { createdAt: "asc" } },
          },
        });
      },
      { timeout: 60_000 },
    );

    return updatedResponse(teamUpdated);
  } catch {
    await Promise.allSettled(uploadedKeys.map(deletePhoto));

    return NextResponse.json(
      {
        error: "Não foi possível atualizar a equipa e guardar as fotos",
        key: "photo",
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) return unauthorized();

  const teamId = await getParamId(context);
  if (!teamId) return invalidParam("Team");

  const team = await prisma.team.findUnique({
    where: { id: teamId, deletedAt: null },
  });
  if (!team) return noFound("Team");

  await prisma.$transaction(async (tx) => {
    const deleted = await tx.team.update({
      where: { id: teamId },
      data: { deletedAt: new Date() },
    });

    await createAuditLog(
      {
        token,
        action: AuditAction.DELETE,
        entity: "Team",
        entityId: teamId,
        before: team,
        after: deleted,
      },
      tx,
    );
  });

  return deletedResponse();
}
