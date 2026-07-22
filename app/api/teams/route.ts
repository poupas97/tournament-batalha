import prisma from "@/lib/prisma";
import { getResponse } from "@/lib/api";

export async function GET(request: Request) {
  const teams = await prisma.team.findMany({
    orderBy: [{ name: "asc" }, { competition: { name: "asc" } }],
    include: {
      competition: true,
      _count: {
        select: { players: true, staffs: true },
      },
    },
  });

  return getResponse(teams);
}
