import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId, getResponse, invalidParam, noFound } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const teamId = await getParamId(context);
  if (!teamId) {
    return invalidParam("Team");
  }

  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
      deletedAt: null,
      competition: { active: true, deletedAt: null },
    },
    include: {
      competition: true,
      awayMatches: {
        where: {
          deletedAt: null,
          homeTeam: { is: { deletedAt: null } },
        },
        include: {
          competition: { select: { name: true } },
          awayTeam: { select: { name: true, photo: true } },
          homeTeam: { select: { name: true, photo: true } },
        },
      },
      homeMatches: {
        where: {
          deletedAt: null,
          awayTeam: { is: { deletedAt: null } },
        },
        include: {
          competition: { select: { name: true } },
          awayTeam: { select: { name: true, photo: true } },
          homeTeam: { select: { name: true, photo: true } },
        },
      },
      players: {
        orderBy: { name: "asc" },
      },
      staffs: {
        orderBy: { name: "asc" },
      },
      _count: {
        select: { players: true, staffs: true },
      },
    },
  });

  if (!team) {
    return noFound("Team");
  }

  return getResponse(team);
}
