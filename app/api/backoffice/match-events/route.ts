import prisma from "@/lib/prisma";
import { sanitizeEnum, sanitizeNumber } from "@/lib/sanitize";
import {
  createdResponse,
  getResponse,
  invalidParam,
  requireToken,
  unauthorized,
} from "@/lib/api";
import {
  CompetitionStatus,
  MatchEventType,
  MatchStatus,
} from "@/generated/prisma";
import { notifyAddMatchEvent } from "@/lib/socket";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchEvents = await prisma.matchEvent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      player: true,
      staff: true,
      team: true,
    },
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

  if (body?.status !== undefined) {
    return invalidParam("Status");
  }

  if (!matchId) {
    return invalidParam("Match");
  }

  if (!type) {
    return invalidParam("Type");
  }

  if (!teamId) {
    return invalidParam("Team");
  }

  if (!minute || minute > 130) {
    return invalidParam("Minute");
  }

  if (Boolean(playerId) === Boolean(staffId)) {
    return invalidParam("PlayerOrStaff");
  }

  if (
    staffId &&
    type !== MatchEventType.YELLOW_CARD &&
    type !== MatchEventType.RED_CARD
  ) {
    return invalidParam("Type");
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      status: true,
      homeTeamId: true,
      awayTeamId: true,
      competition: { select: { status: true } },
    },
  });

  if (!match) {
    return invalidParam("Match");
  }

  if (match.competition.status === CompetitionStatus.FINISHED) {
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

  if (!eventAllowedStatuses.includes(match.status)) {
    return invalidParam("MatchStatus");
  }

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
    data: {
      matchId,
      type,
      minute,
      playerId,
      staffId,
      teamId,
    },
    include: {
      player: true,
      staff: true,
      team: true,
    },
  });

  notifyAddMatchEvent(matchId, matchEvent);

  return createdResponse(matchEvent);
}
