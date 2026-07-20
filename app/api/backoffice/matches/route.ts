import prisma from "@/lib/prisma";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
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
    orderBy: { createdAt: "asc" },
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

  const match = await prisma.match.create({
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

  return createdResponse(match);
}
