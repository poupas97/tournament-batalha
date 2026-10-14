import prisma from "@/lib/prisma";
import { getResponse } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const matches = await prisma.match.findMany({
    where: { competition: { active: true } },
    orderBy: [{ competition: { name: "asc" } }, { date: "asc" }],
    include: { competition: true, homeTeam: true, awayTeam: true },
  });

  return getResponse(matches);
}
