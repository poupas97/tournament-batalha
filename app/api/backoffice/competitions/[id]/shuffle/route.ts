import prisma from "@/lib/prisma";
import { sanitizeEnum, sanitizeNumber } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import {
  createdResponse,
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { canCreateKnockout } from "@/lib/competition/rounds";
import {
  canCreateGroups,
  canCreateLeague,
  createGroupMatches,
  createKnockoutMatches,
  createLeagueMatches,
} from "@/lib/competition/schedule";
import { addKnockoutPlaceholders } from "@/lib/competition/placeholders";
import {
  CompetitionConfig,
  CompetitionStatus,
  Prisma,
} from "@/generated/prisma";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const competitionId = await getParamId(context);
  if (!competitionId) {
    return invalidParam("Competition");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
  });

  if (!competition) {
    return noFound("Competition");
  }

  if (competition.config === null) {
    return invalidParam("CompetitionConfig");
  }

  const matches = await prisma.match.findMany({
    where: { competitionId },
    include: { awayTeam: true, homeTeam: true, events: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  return getResponse(
    addKnockoutPlaceholders({
      config: competition.config,
      qualified: competition.qualified ?? 0,
      matches,
    }),
  );
}

export async function POST(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const competitionId = await getParamId(context);
  if (!competitionId) {
    return invalidParam("Competition");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId, deletedAt: null },
  });

  if (!competition) {
    return noFound("Competition");
  }

  if (competition.status !== CompetitionStatus.DRAFT) {
    return invalidParam("CompetitionStatus");
  }

  const body = await request.json().catch(() => null);
  const config =
    sanitizeEnum(body?.config, CompetitionConfig) || competition.config;
  const qualified = sanitizeNumber(body?.qualified) || competition.qualified;
  const opponents = sanitizeNumber(body?.opponents) || competition.opponents;

  if (!config) {
    return invalidParam("CompetitionConfig");
  }

  if (!opponents) {
    return invalidParam("Opponents", "opponents");
  }

  if (!qualified) {
    return invalidParam("Qualified", "qualified");
  }

  const existingMatches = await prisma.match.count({
    where: { competitionId },
  });

  if (existingMatches > 0) {
    return invalidParam("Matches");
  }

  const teams = await prisma.team.findMany({
    where: { competitionId, deletedAt: null },
  });

  if (!teams.length) {
    return noFound("Team");
  }

  if (qualified > teams.length) {
    return invalidParam("Qualified", "qualified");
  }

  if (!canCreateKnockout(qualified)) {
    return invalidParam("Qualified", "qualified");
  }

  let initialMatches: Prisma.MatchCreateManyInput[];

  if (config === CompetitionConfig.LEAGUE) {
    if (!canCreateLeague(teams.length, opponents)) {
      return invalidParam("Opponents", "opponents");
    }

    initialMatches = createLeagueMatches(
      competition.id,
      teams,
      opponents,
      competition.startDate,
    );
  } else {
    if (!canCreateGroups(teams.length, opponents)) {
      return invalidParam("Opponents", "opponents");
    }

    initialMatches = createGroupMatches(
      competition.id,
      teams,
      opponents,
      competition.startDate,
    );
  }

  const knockoutMatches = createKnockoutMatches(
    competition.id,
    qualified,
    initialMatches,
    competition.startDate,
  );

  if (!knockoutMatches.length) {
    return invalidParam("Qualified", "qualified");
  }

  const matches = [...initialMatches, ...knockoutMatches];

  const createdMatches = await prisma.$transaction(async (tx) => {
    await tx.competition.update({
      where: { id: competition.id },
      data: {
        status: CompetitionStatus.DRAWN,
        config,
        qualified,
        opponents,
      },
    });

    await tx.match.createMany({ data: matches });

    return matches;
  });

  return createdResponse(
    addKnockoutPlaceholders({
      config,
      qualified,
      matches: createdMatches,
    }),
  );
}
