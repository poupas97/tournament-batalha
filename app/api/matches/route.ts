import prisma from "@/lib/prisma";
import { getResponse } from "@/lib/api";

export async function GET(request: Request) {
  const matches = await prisma.match.findMany({
    orderBy: [{ competition: { name: "asc" } }, { round: "asc" }],
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  return getResponse(matches);
}
