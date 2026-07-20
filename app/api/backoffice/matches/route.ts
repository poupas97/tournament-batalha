import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import { requireToken, unauthorized } from "@/lib/api";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matches = await prisma.match.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  return NextResponse.json(matches);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
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

  const match = await prisma.match.create({
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

  return NextResponse.json(match, { status: 201 });
}
