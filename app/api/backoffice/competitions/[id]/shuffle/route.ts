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
import {
  addKnockoutPlaceholders,
  canCreateGroups,
  canCreateKnockout,
  canCreateLeague,
  createGroupMatches,
  createKnockoutMatches,
  createLeagueMatches,
} from "@/lib/shuffle";
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
    where: { id: competitionId },
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
    return invalidParam("Opponents");
  }

  if (!qualified) {
    return invalidParam("Qualified");
  }

  const existingMatches = await prisma.match.count({
    where: { competitionId },
  });

  if (existingMatches > 0) {
    return invalidParam("Matches");
  }

  const teams = await prisma.team.findMany({
    where: { competitionId },
  });

  if (!teams.length) {
    return noFound("Team");
  }

  if (qualified > teams.length) {
    return invalidParam("Qualified");
  }

  if (!canCreateKnockout(qualified)) {
    return invalidParam("Qualified");
  }

  let initialMatches: Prisma.MatchCreateManyInput[];

  if (config === CompetitionConfig.LEAGUE) {
    if (!canCreateLeague(teams.length, opponents)) {
      return invalidParam("Opponents");
    }

    initialMatches = createLeagueMatches(competition.id, teams, opponents);
  } else {
    if (!canCreateGroups(teams.length, opponents)) {
      return invalidParam("Opponents");
    }

    initialMatches = createGroupMatches(competition.id, teams, opponents);
  }

  const knockoutMatches = createKnockoutMatches(competition.id, qualified);

  if (!knockoutMatches.length) {
    return invalidParam("Qualified");
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

    await tx.matchEvent.deleteMany({
      where: { match: { competitionId: competition.id } },
    });

    await tx.match.deleteMany({
      where: { competitionId: competition.id },
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
