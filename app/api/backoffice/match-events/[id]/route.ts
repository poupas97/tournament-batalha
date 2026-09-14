import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { CompetitionStatus, MatchStatus } from "@/generated/prisma";
import {
  deletedResponse,
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { notifyRemoveMatchEvent } from "@/lib/socket";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchEventId = await getParamId(context);
  if (!matchEventId) {
    return invalidParam("Match event");
  }

  const matchEvent = await prisma.matchEvent.findUnique({
    where: { id: matchEventId },
    include: {
      player: true,
      staff: true,
      team: true,
    },
  });

  if (!matchEvent) {
    return noFound("Match event");
  }

  return getResponse(matchEvent);
}

export async function DELETE(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchEventId = await getParamId(context);
  if (!matchEventId) {
    return invalidParam("Match event");
  }

  const matchEvent = await prisma.matchEvent.findUnique({
    where: { id: matchEventId },
    select: {
      id: true,
      matchId: true,
      match: {
        select: {
          status: true,
          competition: { select: { status: true } },
        },
      },
    },
  });

  if (!matchEvent) {
    return noFound("Match event");
  }

  if (matchEvent.match.competition.status === CompetitionStatus.FINISHED) {
    return invalidParam("CompetitionStatus");
  }

  const eventAllowedStatuses: MatchStatus[] = [
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

  if (!eventAllowedStatuses.includes(matchEvent.match.status)) {
    return invalidParam("MatchStatus");
  }

  await prisma.matchEvent.delete({
    where: { id: matchEventId },
  });

  notifyRemoveMatchEvent(matchEvent.matchId, matchEvent);

  return deletedResponse();
}
