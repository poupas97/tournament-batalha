import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import { requireToken, unauthorized } from "@/lib/api";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const players = await prisma.player.findMany({
    orderBy: { createdAt: "desc" },
    include: { team: true },
  });

  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body.name);
  const number = sanitizeText(body.number);
  const teamId = sanitizeNumber(body?.teamId);

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  if (!number || Number(number) < 0 || Number(number) > 99) {
    return NextResponse.json({ error: "Número inválido." }, { status: 400 });
  }

  if (!teamId) {
    return NextResponse.json({ error: "Equipa inválida." }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true },
  });

  if (!team) {
    return NextResponse.json(
      { error: "Equipa não encontrada." },
      { status: 404 },
    );
  }

  const player = await prisma.player.create({
    data: { name, number, teamId },
    include: { team: true },
  });

  return NextResponse.json(player, { status: 201 });
}
