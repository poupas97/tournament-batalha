import prisma from "@/lib/prisma";
import { sanitizeEnum, sanitizeNumber } from "@/lib/sanitize";
import {
  createdResponse,
  getResponse,
  invalidParam,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { MATCH_EVENT_MAX_MINUTE } from "@/constants/validation";
import { CompetitionStatus, MatchEventType } from "@/generated/prisma";
import { notifyAddMatchEvent } from "@/lib/socket";
import { MatchEventBEResponse } from "@/types/match-event";
import { isMatchFinished } from "@/lib/match";
import {
  isEventAllowedStatuses,
  isMatchEventTypeAllowed,
} from "@/lib/matchEvents";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchEvents = await prisma.matchEvent.findMany({
    orderBy: { createdAt: "desc" },
    include: { player: true, staff: true, team: true },
  });

  return getResponse(matchEvents);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const matchId = sanitizeNumber(body?.matchId);
  const type = sanitizeEnum(body?.type, MatchEventType);
  const minute = sanitizeNumber(body?.minute);
  const playerId = sanitizeNumber(body?.playerId);
  const staffId = sanitizeNumber(body?.staffId);
  const teamId = sanitizeNumber(body?.teamId);

  if (!matchId) {
    return invalidParam("Match");
  }

  if (!type) {
    return invalidParam("Type");
  }

  if (!teamId) {
    return invalidParam("Team");
  }

  if (!minute || minute > MATCH_EVENT_MAX_MINUTE) {
    return invalidParam("Minute");
  }

  if (Boolean(playerId) === Boolean(staffId)) {
    return invalidParam("PlayerOrStaff");
  }

  const isCard =
    type === MatchEventType.YELLOW_CARD || type === MatchEventType.RED_CARD;

  if (staffId && !isCard) {
    return invalidParam("Type");
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      status: true,
      round: true,
      homeTeamId: true,
      awayTeamId: true,
      competition: { select: { status: true } },
    },
  });

  if (!match) {
    return invalidParam("Match");
  }

  if (isMatchFinished(match.status)) {
    return invalidParam("MatchStatus");
  }

  if (match.competition.status === CompetitionStatus.FINISHED) {
    return invalidParam("CompetitionStatus");
  }

  if (!isEventAllowedStatuses(match.status)) {
    return invalidParam("MatchStatus");
  }

  if (!isMatchEventTypeAllowed(match.status, type)) {
    return invalidParam("MatchStatus");
  }

  // if (
  //   match.status === MatchStatus.RT_END &&
  //   !isKnockoutRound(match.round) &&
  //   !isCard
  // ) {
  //   return invalidParam("MatchStatus");
  // }

  if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
    return invalidParam("Team");
  }

  const author = playerId
    ? await prisma.player.findUnique({
        where: { id: playerId },
        select: { id: true, teamId: true },
      })
    : await prisma.staff.findUnique({
        where: { id: staffId },
        select: { id: true, teamId: true },
      });

  if (!author || author.teamId !== teamId) {
    return invalidParam("PlayerOrStaff");
  }

  const matchEvent = await prisma.matchEvent.create({
    data: { matchId, type, minute, playerId, staffId, teamId },
    include: { player: true, staff: true, team: true },
  });

  notifyAddMatchEvent(matchId, matchEvent as unknown as MatchEventBEResponse);

  return createdResponse(matchEvent);
}
