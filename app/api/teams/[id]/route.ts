import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId, getResponse, invalidParam, noFound } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const teamId = await getParamId(context);
  if (!teamId) {
    return invalidParam("Team");
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId, competition: { active: true } },
    include: {
      competition: true,
      awayMatches: {
        include: {
          competition: { select: { name: true } },
          awayTeam: { select: { name: true, photo: true } },
          homeTeam: { select: { name: true, photo: true } },
        },
      },
      homeMatches: {
        include: {
          competition: { select: { name: true } },
          awayTeam: { select: { name: true, photo: true } },
          homeTeam: { select: { name: true, photo: true } },
        },
      },
      players: {
        orderBy: { createdAt: "asc" },
      },
      staffs: {
        orderBy: { createdAt: "asc" },
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
