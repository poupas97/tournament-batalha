import prisma from "@/lib/prisma";
import { sanitizeEnum } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import {
  createdResponse,
  getParamId,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { MatchStatus } from "@/generated/prisma";
import { notifyMatchStatus } from "@/lib/socket";

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
  const status = sanitizeEnum(body?.status, MatchStatus);

  if (!status) {
    return invalidParam("Status");
  }

  const existing = await prisma.competition.findUnique({
    where: { id: matchId },
    select: { id: true },
  });

  if (!existing) {
    return noFound("Match");
  }

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      status,
    },
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  notifyMatchStatus(matchId, { status: match.status });

  return createdResponse(match);
}
