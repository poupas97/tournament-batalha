import prisma from "@/lib/prisma";
import {
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { RouteContext } from "@/types/api";
import { rankingScoresQuery } from "@/enums/competitionStats";

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
    where: { id: competitionId, active: true },
    select: { id: true },
  });

  if (!competition) {
    return noFound("Competition");
  }

  const rankingScores = await rankingScoresQuery(prisma, competitionId);

  return getResponse({ rankingScores });
}
