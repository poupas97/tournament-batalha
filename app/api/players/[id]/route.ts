import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId, getResponse, invalidParam, noFound } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const playerId = await getParamId(context);
  if (!playerId) {
    return invalidParam("Player");
  }

  const player = await prisma.player.findUnique({
    where: {
      id: playerId,
      team: {
        deletedAt: null,
        competition: { active: true, deletedAt: null },
      },
    },
    include: {
      team: { include: { competition: true } },
      events: {
        where: { match: { deletedAt: null } },
        orderBy: { minute: "asc" },
        include: {
          match: {
            include: {
              competition: { select: { name: true } },
              homeTeam: { select: { name: true } },
              awayTeam: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!player) {
    return noFound("Player");
  }

  return getResponse(player);
}
