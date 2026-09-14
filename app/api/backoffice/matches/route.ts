import prisma from "@/lib/prisma";
import { sanitizeDate, sanitizeNumber, sanitizeText } from "@/lib/sanitize";
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

  const matches = await prisma.match.findMany({
    orderBy: [{ competition: { name: "asc" } }, { date: "asc" }],
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  return getResponse(matches);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
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

  const teams = await prisma.team.findMany({
    where: { id: { in: [homeTeamId, awayTeamId] }, competitionId },
    select: { id: true },
  });

  if (teams.length !== 2) {
    return invalidParam("Teams");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { id: true },
  });

  if (!competition) {
    return invalidParam("Competition");
  }

  const match = await prisma.match.create({
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

  return createdResponse(match);
}
