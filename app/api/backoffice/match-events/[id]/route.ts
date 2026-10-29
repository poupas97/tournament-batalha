import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { AuditAction, CompetitionStatus } from "@/generated/prisma";
import { createAuditLog } from "@/lib/audit";
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
import { isEventAllowedStatuses } from "@/lib/matchEvents";
import { isMatchFinished } from "@/lib/match";

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
      match: { include: { competition: true } },
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
    where: {
      id: matchEventId,
      match: { deletedAt: null, competition: { deletedAt: null } },
    },
    include: {
      team: true,
      player: true,
      staff: true,
      match: { include: { competition: true } },
    },
  });

  if (!matchEvent) {
    return noFound("Match event");
  }

  if (isMatchFinished(matchEvent.match.status)) {
    return invalidParam("MatchStatus");
  }

  if (matchEvent.match.competition.status === CompetitionStatus.FINISHED) {
    return invalidParam("CompetitionStatus");
  }

  if (!isEventAllowedStatuses(matchEvent.match.status)) {
    return invalidParam("MatchStatus");
  }

  await prisma.$transaction(async (tx) => {
    const deleted = await tx.matchEvent.delete({ where: { id: matchEventId } });

    await createAuditLog(
      {
        token,
        action: AuditAction.DELETE,
        entity: "MatchEvent",
        entityId: matchEventId,
        before: matchEvent,
        after: deleted,
      },
      tx,
    );
  });

  notifyRemoveMatchEvent(matchEvent.matchId, matchEvent);

  return deletedResponse();
}
