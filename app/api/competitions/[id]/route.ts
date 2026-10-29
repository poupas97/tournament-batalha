import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId, getResponse, invalidParam, noFound } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const competitionId = await getParamId(context);
  if (!competitionId) {
    return invalidParam("Competition");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId, active: true, deletedAt: null },
    include: {
      teams: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: {
          _count: { select: { players: true, staffs: true } },
        },
      },
      _count: { select: { teams: { where: { deletedAt: null } } } },
    },
  });

  if (!competition) {
    return noFound("Competition");
  }

  return getResponse(competition);
}
