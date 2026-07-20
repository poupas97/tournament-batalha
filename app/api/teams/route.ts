import prisma from "@/lib/prisma";
import { getResponse } from "@/lib/api";

export async function GET(request: Request) {
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      competition: true,
      _count: {
        select: { players: true, staffs: true },
      },
    },
  });

  return getResponse(teams);
}
