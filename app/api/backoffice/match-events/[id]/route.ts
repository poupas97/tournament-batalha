import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitizeEnum, sanitizeNumber } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import { getParamId, requireToken, unauthorized } from "@/lib/api";
import { MatchEventType } from "@/generated/prisma";
import { notifyRemoveMatchEvent } from "@/lib/socket";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchEventId = await getParamId(context);
  if (!matchEventId) {
    return NextResponse.json({ error: "Jogo inválido." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchEventId },
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

  const matchEventId = await getParamId(context);
  if (!matchEventId) {
    return NextResponse.json(
      { error: "Evento de jogo inválido." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const matchId = sanitizeNumber(body?.matchId);
  const type = sanitizeEnum(body?.type, MatchEventType);
  const minute = sanitizeNumber(body?.minute);
  const playerId = sanitizeNumber(body?.playerId);
  const staffId = sanitizeNumber(body?.staffId);
  const teamId = sanitizeNumber(body?.teamId);

  if (!matchId) {
    return NextResponse.json({ error: "Jogo inválido." }, { status: 400 });
  }

  if (!type) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }

  if (!teamId) {
    return NextResponse.json({ error: "Equipa inválida." }, { status: 400 });
  }

  const matchEvent = await prisma.matchEvent.create({
    data: {
      matchId,
      type,
      minute: minute ?? 0,
      playerId: playerId ?? undefined,
      staffId: staffId ?? undefined,
      teamId,
    },
    include: {
      player: true,
      staff: true,
      team: true,
    },
  });

  return NextResponse.json(matchEvent);
}

export async function DELETE(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchEventId = await getParamId(context);
  if (!matchEventId) {
    return NextResponse.json(
      { error: "Utilizador inválido." },
      { status: 400 },
    );
  }

  const matchEvent = await prisma.matchEvent.findUnique({
    where: { id: matchEventId },
    select: { id: true, matchId: true },
  });

  if (!matchEvent) {
    return NextResponse.json(
      { error: "Evento de jogo não encontrado." },
      { status: 404 },
    );
  }

  await prisma.matchEvent.delete({
    where: { id: matchEventId },
  });

  notifyRemoveMatchEvent(matchEvent.matchId, matchEvent);

  return NextResponse.json({ success: true });
}
