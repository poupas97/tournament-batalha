import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const competitionId = await getParamId(context);
  if (!competitionId) {
    return NextResponse.json(
      { error: "Competição inválida." },
      { status: 400 },
    );
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      teams: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!competition) {
    return NextResponse.json(
      { error: "Competição não encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json(competition);
}
