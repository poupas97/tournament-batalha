import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId, getResponse, invalidParam, noFound } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const competitionId = await getParamId(context);
  if (!competitionId) {
    return invalidParam("Competition");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId, active: true },
    include: {
      teams: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!competition) {
    return noFound("Competition");
  }

  return getResponse(competition);
}
