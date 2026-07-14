import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireToken } from "@/lib/token";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import { getParamId, unauthorized } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

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

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchId = await getParamId(context);
  if (!matchId) {
    return NextResponse.json({ error: "Equipa inválida." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const date = sanitizeText(body?.date);
  const round = sanitizeText(body?.round);
  const competitionId = sanitizeNumber(body.competitionId);
  const homeTeamId = sanitizeNumber(body.homeTeamId);
  const awayTeamId = sanitizeNumber(body.awayTeamId);

  if (!date) {
    return NextResponse.json({ error: "Data inválida." }, { status: 400 });
  }

  if (!round) {
    return NextResponse.json({ error: "Ronda inválida." }, { status: 400 });
  }

  if (!competitionId) {
    return NextResponse.json(
      { error: "Competição inválida." },
      { status: 400 },
    );
  }

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      date: new Date(date),
      round,
      competitionId,
      homeTeamId,
      awayTeamId,
    },
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  return NextResponse.json(match);
}
