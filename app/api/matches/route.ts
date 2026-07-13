import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  return NextResponse.json(matches);
}
