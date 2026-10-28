import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  MAX_NAME_LENGTH,
  PLAYER_NUMBER_MAX,
  PLAYER_NUMBER_MIN,
} from "@/constants/validation";
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
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import { CompetitionStatus } from "@/generated/prisma";
import { RouteContext } from "@/types/api";
import { isPhotoUrl, isValidPhotoValue } from "@/lib/photo";
import { getRandomSuffix } from "@/lib/random";
import { deletePhoto, uploadPhoto } from "@/lib/objectStorage";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const playerId = await getParamId(context);
  if (!playerId) {
    return invalidParam("Player");
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      team: { include: { competition: true } },
      events: {
        orderBy: { minute: "asc" },
        include: {
          match: {
            include: {
              competition: { select: { name: true } },
              homeTeam: { select: { name: true } },
              awayTeam: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!player) {
    return noFound("Player");
  }

  return getResponse(player);
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const playerId = await getParamId(context);
  if (!playerId) {
    return invalidParam("Player");
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name);
  const number = sanitizeNumber(body?.number);
  const teamId = sanitizeNumber(body?.teamId);
  const photo = body?.photo === undefined ? null : body.photo;

  if (!name || name.length > MAX_NAME_LENGTH) {
    return invalidParam("Name", "name");
  }

  if (!number || number < PLAYER_NUMBER_MIN || number > PLAYER_NUMBER_MAX) {
    return invalidParam("Number", "number");
  }

  if (!teamId) {
    return invalidParam("Team");
  }

  if (!isValidPhotoValue(photo)) {
    return invalidParam("Photo", "photo");
  }

  const [player, team] = await Promise.all([
    prisma.player.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        team: { select: { competition: { select: { status: true } } } },
      },
    }),
    prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, competition: { select: { status: true } } },
    }),
  ]);

  if (!player) {
    return noFound("Player");
  }

  if (!team) {
    return noFound("Team");
  }

  if (
    player.team.competition.status !== CompetitionStatus.DRAFT ||
    team.competition.status !== CompetitionStatus.DRAFT
  ) {
    return invalidParam("CompetitionStatus");
  }

  const uploadedKeys: string[] = [];
  try {
    let savedPhoto = photo;
    if (photo && !isPhotoUrl(photo)) {
      const key = `player/${playerId}/${getRandomSuffix()}`;
      uploadedKeys.push(key);
      savedPhoto = await uploadPhoto(key, photo);
    }

    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: { name, number, teamId, photo: savedPhoto },
      include: { team: { include: { competition: true } } },
    });

    return updatedResponse(updatedPlayer);
  } catch {
    await Promise.allSettled(uploadedKeys.map(deletePhoto));

    return NextResponse.json(
      {
        error: "Não foi possível atualizar o jogador e guardar a foto",
        key: "photo",
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const playerId = await getParamId(context);
  if (!playerId) {
    return invalidParam("Player");
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      id: true,
      team: { select: { competition: { select: { status: true } } } },
    },
  });

  if (!player) {
    return noFound("Player");
  }

  if (player.team.competition.status !== CompetitionStatus.DRAFT) {
    return invalidParam("CompetitionStatus");
  }

  await prisma.player.delete({
    where: { id: playerId },
  });

  return deletedResponse();
}
