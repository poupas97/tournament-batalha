import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId, getResponse, invalidParam, noFound } from "@/lib/api";
import { addKnockoutPlaceholders } from "@/lib/shuffle";

export async function GET(request: Request, context: RouteContext) {
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
