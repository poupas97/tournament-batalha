import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { Player } from "@/generated/prisma";
import { requireToken } from "@/lib/token";
import { sanitizeText } from "@/lib/sanitize";

type RouteContext = {
  params: {
    id: string;
  };
};

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
    return NextResponse.json(
      { error: "Equipa não encontrada." },
      { status: 404 },
    );
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
  const staff = getMembersFromBody(body, "staff");

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  const existingTeam = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true },
  });

  if (!existingTeam) {
    return NextResponse.json(
      { error: "Equipa não encontrada." },
      { status: 404 },
    );
  }

  const team = await prisma.$transaction(async (tx) => {
    await tx.player.deleteMany({ where: { teamId } });
    await tx.staff.deleteMany({ where: { teamId } });

    return tx.team.update({
      where: { id: teamId },
      data: {
        name,
        players:
          body.players?.length > 0
            ? {
                create: (body.players as Player[]).map((it) => ({
                  name: it.name,
                  number: it.number,
                })),
              }
            : undefined,
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
