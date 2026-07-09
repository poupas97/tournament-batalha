import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

function sanitizeText(value: string) {
  return value.trim().replace(/["'`;<>]/g, "");
}

function getId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function requireToken(request: Request) {
  return getToken({ req: request as any, secret });
}

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const players = await prisma.player.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      team: true,
    },
  });

  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true },
  });

  if (!team) {
    return NextResponse.json({ error: "Equipa não encontrada." }, { status: 404 });
  }

  const player = await prisma.player.create({
    data: {
      name,
      teamId,
    },
    include: {
      team: true,
    },
  });

  return NextResponse.json(player, { status: 201 });
}
