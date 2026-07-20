import prisma from "@/lib/prisma";
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
import { RouteContext } from "@/types/api";

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
      team: true,
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
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";
  const teamId = sanitizeNumber(body?.teamId);

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  if (!teamId) {
    return invalidParam("Team");
  }

  const [player, team] = await Promise.all([
    prisma.player.findUnique({ where: { id: playerId }, select: { id: true } }),
    prisma.team.findUnique({ where: { id: teamId }, select: { id: true } }),
  ]);

  if (!player) {
    return noFound("Player");
  }

  if (!team) {
    return noFound("Team");
  }

  const existing = await prisma.player.findUnique({
    where: { id: playerId },
    select: { id: true },
  });

  if (!existing) {
    return noFound("Player");
  }

  const updatedPlayer = await prisma.player.update({
    where: { id: playerId },
    data: {
      name,
      teamId,
    },
    include: {
      team: true,
    },
  });

  return updatedResponse(updatedPlayer);
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
    select: { id: true },
  });

  if (!player) {
    return noFound("Player");
  }

  await prisma.player.delete({
    where: { id: playerId },
  });

  return deletedResponse();
}
