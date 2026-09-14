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
import { CompetitionStatus, MatchStatus } from "@/generated/prisma";
import { notifyMatchStatus } from "@/lib/socket";
import { canTransition } from "@/lib/match";

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

  const existing = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      status: true,
      competition: { select: { id: true, status: true } },
    },
  });

  if (!existing) {
    return noFound("Match");
  }

  if (existing.competition.status === CompetitionStatus.FINISHED) {
    return invalidParam("CompetitionStatus");
  }

  const matchStartedStatuses: MatchStatus[] = [
    MatchStatus.RT_START,
    MatchStatus.RT_HALF_TIME,
    MatchStatus.RT_RESTART,
    MatchStatus.RT_END,
    MatchStatus.ET_START,
    MatchStatus.ET_HALF_TIME,
    MatchStatus.ET_RESTART,
    MatchStatus.ET_END,
    MatchStatus.PENALTIES,
  ];

  if (
    matchStartedStatuses.includes(status) &&
    existing.competition.status !== CompetitionStatus.IN_PROGRESS
  ) {
    return invalidParam("CompetitionStatus");
  }

  if (!canTransition(existing.status, status)) {
    return invalidParam("MatchStatus");
  }

  const match = await prisma.match.update({
    where: { id: matchId },
    data: { status },
  });

  notifyMatchStatus(matchId, { status: match.status });

  return createdResponse(match);
}
