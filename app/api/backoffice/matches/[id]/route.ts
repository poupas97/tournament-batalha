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
import {
  AuditAction,
  CompetitionStatus,
  MatchStatus,
} from "@/generated/prisma";
import { createAuditLog } from "@/lib/audit";

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
        include: { players: true, staffs: true },
      },
      awayTeam: {
        include: { players: true, staffs: true },
      },
      events: {
        orderBy: { createdAt: "desc" },
        include: { team: true, player: true, staff: true },
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
  const date = sanitizeDate(body?.date);
  const round = sanitizeText(body?.round);
  const competitionId = sanitizeNumber(body?.competitionId);
  const homeTeamId = sanitizeNumber(body?.homeTeamId);
  const awayTeamId = sanitizeNumber(body?.awayTeamId);

  if (!date) {
    return invalidParam("Date");
  }

  const existing = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      date: true,
      round: true,
      competitionId: true,
      homeTeamId: true,
      awayTeamId: true,
      group: true,
      status: true,
      competition: { select: { id: true, status: true } },
    },
  });

  if (!existing) {
    return noFound("Match");
  }

  const isScheduled = existing.status === MatchStatus.SCHEDULED;
  const isPostponed = existing.status === MatchStatus.POSTPONED;

  if (!isScheduled && !isPostponed) {
    return invalidParam("MatchStatus");
  }

  if (isPostponed) {
    const matchUpdated = await prisma.$transaction(async (tx) => {
      const updated = await tx.match.update({
        where: { id: matchId },
        data: { date, status: MatchStatus.SCHEDULED },
        include: { competition: true, homeTeam: true, awayTeam: true },
      });

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

    return updatedResponse(matchUpdated);
  }

  if (
    existing.competition.status !== CompetitionStatus.DRAFT &&
    existing.competition.status !== CompetitionStatus.DRAWN
  ) {
    return invalidParam("CompetitionStatus");
  }

  if (!round) {
    return invalidParam("Round");
  }

  if (!competitionId) {
    return invalidParam("Competition");
  }

  const targetCompetition = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { id: true },
  });

  if (!targetCompetition) {
    return invalidParam("Competition");
  }

  const assignedTeamIds = [
    homeTeamId ?? existing.homeTeamId,
    awayTeamId ?? existing.awayTeamId,
  ].filter((teamId): teamId is number => teamId !== null);

  if (
    assignedTeamIds.length === 2 &&
    assignedTeamIds[0] === assignedTeamIds[1]
  ) {
    return invalidParam("Teams");
  }

  if (assignedTeamIds.length > 0) {
    const teams = await prisma.team.findMany({
      where: { id: { in: assignedTeamIds }, competitionId },
      select: { id: true },
    });

    if (teams.length !== assignedTeamIds.length) {
      return invalidParam("Teams");
    }
  }

  const matchUpdated = await prisma.$transaction(async (tx) => {
    const updated = await tx.match.update({
      where: { id: matchId },
      data: {
        date,
        round,
        competitionId,
        homeTeamId,
        awayTeamId,
      },
      include: { competition: true, homeTeam: true, awayTeam: true },
    });

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

  return updatedResponse(matchUpdated);
}
