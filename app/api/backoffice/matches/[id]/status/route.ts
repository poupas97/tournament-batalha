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
import {
  AuditAction,
  CompetitionStatus,
  MatchEventType,
  Match,
  MatchStatus,
} from "@/generated/prisma";
import { notifyMatchStatus } from "@/lib/socket";
import { canTransition, isMatchFinished } from "@/lib/match";
import { createAuditLog } from "@/lib/audit";
import { resolveCompetitionProgression } from "@/lib/competition/progression";

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
    where: { id: matchId, deletedAt: null, competition: { deletedAt: null } },
    select: {
      id: true,
      status: true,
      round: true,
      homeTeamId: true,
      awayTeamId: true,
      competition: {
        select: { id: true, status: true },
      },
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
    MatchStatus.PENALTIES_START,
    MatchStatus.PENALTIES_END,
  ];

  if (
    matchStartedStatuses.includes(status) &&
    existing.competition.status !== CompetitionStatus.IN_PROGRESS
  ) {
    return invalidParam("CompetitionStatus");
  }

  if (!canTransition(existing as unknown as Match, status)) {
    return invalidParam("MatchStatus");
  }

  if (status === MatchStatus.PENALTIES_END) {
    const penaltyEvents = await prisma.matchEvent.findMany({
      where: { matchId, type: MatchEventType.PENALTY_GOAL },
      select: { teamId: true },
    });
    const homePenaltyGoals = penaltyEvents.filter(
      (event) => event.teamId === existing.homeTeamId,
    ).length;
    const awayPenaltyGoals = penaltyEvents.filter(
      (event) => event.teamId === existing.awayTeamId,
    ).length;

    if (homePenaltyGoals === awayPenaltyGoals) {
      return invalidParam("MatchStatus");
    }
  }

  const match = await prisma.$transaction(async (tx) => {
    const updated = await tx.match.update({
      where: { id: matchId },
      data: { status },
      select: {
        id: true,
        status: true,
        deletedAt: true,
        competition: {
          select: { id: true, status: true },
        },
      },
    });

    if (isMatchFinished(updated.status)) {
      await resolveCompetitionProgression(updated.competition.id, tx);
    }

    await createAuditLog(
      {
        token,
        action: AuditAction.UPDATE,
        entity: "Match",
        entityId: matchId,
        before: existing,
        after: updated,
      },
      tx,
    );

    return updated;
  });

  notifyMatchStatus(matchId, { status: match.status });

  return createdResponse(match);
}
