import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

type RouteContext = {
  params: {
    id: string;
  };
};

function sanitizeText(value: string) {
  return value.trim().replace(/["'`;<>]/g, "");
}

function sanitizeColor(value: unknown) {
  if (typeof value !== "string") {
    return "#2563eb";
  }

  const color = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#2563eb";
}

function getTeamId(id: string) {
  const teamId = Number(id);
  return Number.isInteger(teamId) && teamId > 0 ? teamId : null;
}

function getMembersFromBody(body: any, key: "players" | "staff") {
  if (!Array.isArray(body?.[key])) {
    return [];
  }

  return body[key]
    .map((member: any) =>
      typeof member?.name === "string" ? sanitizeText(member.name) : "",
    )
    .filter((name: string) => name.length > 0 && name.length <= 100)
    .map((name: string) => ({ name }));
}

async function requireToken(request: Request) {
  return getToken({ req: request as any, secret });
}

export async function GET(request: Request, { params }: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const teamId = getTeamId(params.id);
  if (!teamId) {
    return NextResponse.json({ error: "Equipa inválida." }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      players: {
        orderBy: { createdAt: "asc" },
      },
      staff: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!team) {
    return NextResponse.json({ error: "Equipa não encontrada." }, { status: 404 });
  }

  return NextResponse.json(team);
}

export async function PUT(request: Request, { params }: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const teamId = getTeamId(params.id);
  if (!teamId) {
    return NextResponse.json({ error: "Equipa inválida." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";
  const color = sanitizeColor(body?.color);
  const players = getMembersFromBody(body, "players");
  const staff = getMembersFromBody(body, "staff");

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  const existingTeam = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true },
  });

  if (!existingTeam) {
    return NextResponse.json({ error: "Equipa não encontrada." }, { status: 404 });
  }

  const team = await prisma.$transaction(async (tx) => {
    await tx.player.deleteMany({ where: { teamId } });
    await tx.staff.deleteMany({ where: { teamId } });

    return tx.team.update({
      where: { id: teamId },
      data: {
        name,
        color,
        players: players.length > 0 ? { create: players } : undefined,
        staff: staff.length > 0 ? { create: staff } : undefined,
      },
      include: {
        players: {
          orderBy: { createdAt: "asc" },
        },
        staff: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  });

  return NextResponse.json(team);
}
