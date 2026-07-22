import prisma from "@/lib/prisma";
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
  canCreateLeague,
  createGroupMatches,
  createLeagueMatches,
} from "@/lib/shuffle";
import { CompetitionConfig, Prisma } from "@/generated/prisma";

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
    select: { id: true, config: true, opponents: true },
  });

  if (!competition) {
    return noFound("Competition");
  }

  if (competition.opponents === null) {
    return invalidParam("Opponents");
  }

  const teams = await prisma.team.findMany({
    where: { competitionId },
  });

  if (!teams.length) {
    return noFound("Team");
  }

  let matches: Prisma.MatchCreateManyInput[];

  if (competition.config === CompetitionConfig.LEAGUE) {
    if (!canCreateLeague(teams.length, competition.opponents!)) {
      return invalidParam("Opponents");
    }

    matches = createLeagueMatches(
      competition.id,
      teams,
      competition.opponents!,
    );
  } else {
    matches = createGroupMatches(competition.id, teams, competition.opponents);
  }

  const createdMatches = await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({
      where: { competitionId: competition.id },
    });

    await tx.match.createMany({ data: matches });

    return matches;
  });

  return createdResponse(createdMatches);

  return createdResponse(createdMatches);
}
