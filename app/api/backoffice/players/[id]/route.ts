import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireToken } from "@/lib/token";
import { sanitizeText } from "@/lib/sanitize";

type RouteContext = {
  params: {
    id: string;
  };
};

function getId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request: Request, { params }: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const playerId = getId(params.id);
  if (!playerId) {
    return NextResponse.json({ error: "Jogador inválido." }, { status: 400 });
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      team: true,
    },
  });

  if (!player) {
    return NextResponse.json(
      { error: "Jogador não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json(player);
}

export async function PUT(request: Request, { params }: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const playerId = getId(params.id);
  if (!playerId) {
    return NextResponse.json({ error: "Jogador inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";
  const teamId = getId(body?.teamId);

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  if (!teamId) {
    return NextResponse.json({ error: "Equipa inválida." }, { status: 400 });
  }

  const [player, team] = await Promise.all([
    prisma.player.findUnique({ where: { id: playerId }, select: { id: true } }),
    prisma.team.findUnique({ where: { id: teamId }, select: { id: true } }),
  ]);

  if (!player) {
    return NextResponse.json(
      { error: "Jogador não encontrado." },
      { status: 404 },
    );
  }

  if (!team) {
    return NextResponse.json(
      { error: "Equipa não encontrada." },
      { status: 404 },
    );
  }

  const updatedPlayer = await prisma.player.update({
    where: { id: playerId },
    data: {
      name,
      teamId,
    },
    include: {
      team: true,
    },
  });

  return NextResponse.json(updatedPlayer);
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const playerId = getId(params.id);
  if (!playerId) {
    return NextResponse.json({ error: "Jogador inválido." }, { status: 400 });
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { id: true },
  });

  if (!player) {
    return NextResponse.json(
      { error: "Jogador não encontrado." },
      { status: 404 },
    );
  }

  await prisma.player.delete({
    where: { id: playerId },
  });

  return NextResponse.json({ success: true });
}
