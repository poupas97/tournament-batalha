import prisma from "@/lib/prisma";
import { sanitizeEnum, sanitizeNumber } from "@/lib/sanitize";
import {
  createdResponse,
  getResponse,
  invalidParam,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { MatchEventType } from "@/generated/prisma";
import { notifyAddMatchEvent } from "@/lib/socket";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchEvents = await prisma.matchEvent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      player: true,
      staff: true,
      team: true,
    },
  });

  return getResponse(matchEvents);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const matchId = sanitizeNumber(body?.matchId);
  const type = sanitizeEnum(body?.type, MatchEventType);
  const minute = sanitizeNumber(body?.minute);
  const playerId = sanitizeNumber(body?.playerId);
  const staffId = sanitizeNumber(body?.staffId);
  const teamId = sanitizeNumber(body?.teamId);

  if (!matchId) {
    return invalidParam("Match");
  }

  if (!type) {
    return invalidParam("Type");
  }

  if (!teamId) {
    return invalidParam("Team");
  }

  const matchEvent = await prisma.matchEvent.create({
    data: {
      matchId,
      type,
      minute: minute ?? 0,
      playerId: playerId ?? undefined,
      staffId: staffId ?? undefined,
      teamId,
    },
    include: {
      player: true,
      staff: true,
      team: true,
    },
  });

  notifyAddMatchEvent(matchId, matchEvent);

  return createdResponse(matchEvent);
}
