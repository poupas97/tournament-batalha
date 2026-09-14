import prisma from "@/lib/prisma";
import { sanitizeDate, sanitizeNumber, sanitizeText } from "@/lib/sanitize";
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
import { CompetitionStatus, MatchStatus } from "@/generated/prisma";

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

  if (body?.status !== undefined) {
    return invalidParam("Status");
  }

  const date = sanitizeDate(body?.date);
  const round = sanitizeText(body?.round);
  const competitionId = sanitizeNumber(body?.competitionId);
  const homeTeamId = sanitizeNumber(body?.homeTeamId);
  const awayTeamId = sanitizeNumber(body?.awayTeamId);

  if (!date) {
    return invalidParam("Date");
  }

  if (!round) {
    return invalidParam("Round");
  }

  if (!competitionId) {
    return invalidParam("Competition");
  }

  if (
    !homeTeamId ||
    !awayTeamId ||
    (homeTeamId && awayTeamId && homeTeamId === awayTeamId)
  ) {
    return invalidParam("Teams");
  }

  const existing = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      status: true,
      competition: { select: { status: true } },
    },
  });

  if (!existing) {
    return noFound("Match");
  }

  if (existing.status !== MatchStatus.SCHEDULED) {
    return invalidParam("MatchStatus");
  }

  if (existing.competition.status !== CompetitionStatus.DRAFT) {
    return invalidParam("CompetitionStatus");
  }

  const teams = await prisma.team.findMany({
    where: { id: { in: [homeTeamId, awayTeamId] }, competitionId },
    select: { id: true },
  });

  if (teams.length !== 2) {
    return invalidParam("Teams");
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

  const matchUpdated = await prisma.match.update({
    where: { id: matchId },
    data: {
      date,
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
