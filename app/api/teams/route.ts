import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { players: true, staffs: true },
      },
    },
  });

  return NextResponse.json(teams);
}
