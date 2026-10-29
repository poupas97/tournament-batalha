import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId, getResponse, invalidParam, noFound } from "@/lib/api";
import { addKnockoutPlaceholders } from "@/lib/competition/placeholders";

export async function GET(request: Request, context: RouteContext) {
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

  if (competition.config === null) {
    return invalidParam("CompetitionConfig");
  }

  const matches = await prisma.match.findMany({
    where: {
      competitionId,
      deletedAt: null,
      AND: [
        {
          OR: [
            { homeTeamId: null },
            { homeTeam: { is: { deletedAt: null } } },
          ],
        },
        {
          OR: [
            { awayTeamId: null },
            { awayTeam: { is: { deletedAt: null } } },
          ],
        },
      ],
    },
    include: {
      awayTeam: true,
      homeTeam: true,
      events: {
        where: {
          team: { deletedAt: null },
        },
      },
    },
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
