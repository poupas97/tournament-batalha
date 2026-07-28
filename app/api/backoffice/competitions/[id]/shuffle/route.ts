import prisma from "@/lib/prisma";
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
  canCreateLeague,
  createGroupMatches,
  createKnockoutMatches,
  createLeagueMatches,
} from "@/lib/shuffle";
import { CompetitionConfig, Prisma } from "@/generated/prisma";

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
    select: { id: true, config: true, opponents: true, qualified: true },
  });

  if (!competition) {
    return noFound("Competition");
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
    select: { id: true, config: true, opponents: true, qualified: true },
  });

  if (!competition) {
    return noFound("Competition");
  }

  if (competition.opponents === null) {
    return invalidParam("Opponents");
  }

  if (competition.qualified === null) {
    return invalidParam("Qualified");
  }

  const teams = await prisma.team.findMany({
    where: { competitionId },
  });

  if (!teams.length) {
    return noFound("Team");
  }

  if (competition.qualified > teams.length) {
    return invalidParam("Qualified");
  }

  let initialMatches: Prisma.MatchCreateManyInput[];

  if (competition.config === CompetitionConfig.LEAGUE) {
    if (!canCreateLeague(teams.length, competition.opponents!)) {
      return invalidParam("Opponents");
    }

    initialMatches = createLeagueMatches(
      competition.id,
      teams,
      competition.opponents!,
    );
  } else {
    initialMatches = createGroupMatches(
      competition.id,
      teams,
      competition.opponents,
    );
  }

  const knockoutMatches = createKnockoutMatches(
    competition.id,
    competition.qualified,
  );

  if (!knockoutMatches.length) {
    return invalidParam("Qualified");
  }

  const matches = [...initialMatches, ...knockoutMatches];

  const createdMatches = await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({
      where: { competitionId: competition.id },
    });

    await tx.match.createMany({ data: matches });

    return matches;
  });

  return createdResponse(
    addKnockoutPlaceholders({
      config: competition.config,
      qualified: competition.qualified,
      matches: createdMatches,
    }),
  );
}
