import prisma from "@/lib/prisma";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
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

  const matchId = await getParamId(context);
  if (!matchId) {
    return invalidParam("Match");
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      competition: true,
      homeTeam: {
        include: {
          players: true,
          staffs: true,
        },
      },
      awayTeam: {
        include: {
          players: true,
          staffs: true,
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        include: {
          team: true,
          player: true,
          staff: true,
        },
      },
    },
  });

  if (!match) {
    return noFound("Match event");
  }

  return getResponse(match);
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchId = await getParamId(context);
  if (!matchId) {
    return invalidParam("Match");
  }

  const body = await request.json().catch(() => null);
  const date = sanitizeText(body?.date);
  const round = sanitizeText(body?.round);
  const competitionId = sanitizeNumber(body.competitionId);
  const homeTeamId = sanitizeNumber(body.homeTeamId);
  const awayTeamId = sanitizeNumber(body.awayTeamId);

  if (!date) {
    return invalidParam("Date");
  }

  if (!round) {
    return invalidParam("Round");
  }

  if (!competitionId) {
    return invalidParam("Competition");
  }

  const existing = await prisma.match.findUnique({
    where: { id: matchId },
    select: { id: true },
  });

  if (!existing) {
    return noFound("Match");
  }

  const matchUpdated = await prisma.match.update({
    where: { id: matchId },
    data: {
      date: new Date(date),
      round,
      competitionId,
      homeTeamId,
      awayTeamId,
    },
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  return updatedResponse(matchUpdated);
}
