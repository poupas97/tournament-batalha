import prisma from "@/lib/prisma";
import { getResponse, getSearchParam } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const today = getSearchParam(request, "today");

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const matches = await prisma.match.findMany({
    where: {
      competition: { active: true },
      ...(today && { date: { gte: startOfDay, lte: endOfDay } }),
    },
    orderBy: [{ competition: { name: "asc" } }, { date: "asc" }],
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  return getResponse(matches);
}
