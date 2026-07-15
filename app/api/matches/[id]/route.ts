import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const matchId = await getParamId(context);

  if (!matchId) {
    return NextResponse.json({ error: "Jogo inválido." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      competition: true,
      homeTeam: {
        include: {
          players: true,
          staffs: true,
        },
      },
      awayTeam: {
        include: {
          players: true,
          staffs: true,
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        include: {
          team: true,
          player: true,
          staff: true,
        },
      },
    },
  });

  if (!match) {
    return NextResponse.json(
      { error: "Jogo não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json(match);
}
