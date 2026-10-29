import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId, getResponse, invalidParam, noFound } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const matchId = await getParamId(context);

  if (!matchId) {
    return invalidParam("Match");
  }

  const match = await prisma.match.findUnique({
    where: {
      id: matchId,
      deletedAt: null,
      competition: { active: true, deletedAt: null },
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
      competition: true,
      homeTeam: {
        include: { players: true, staffs: true },
      },
      awayTeam: {
        include: { players: true, staffs: true },
      },
      events: {
        where: {
          team: { deletedAt: null },
        },
        orderBy: { createdAt: "desc" },
        include: { team: true, player: true, staff: true },
      },
    },
  });

  if (!match) {
    return noFound("Match");
  }

  return getResponse(match);
}
