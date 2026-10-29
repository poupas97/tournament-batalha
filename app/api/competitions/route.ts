import prisma from "@/lib/prisma";
import { getResponse } from "@/lib/api";

export async function GET(request: Request) {
  const competitions = await prisma.competition.findMany({
    where: { active: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { teams: { where: { deletedAt: null } } } },
    },
  });

  return getResponse(competitions);
}
