import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { Player, Staff } from "@/generated/prisma";
import { requireToken } from "@/lib/token";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { players: true, staffs: true },
      },
    },
  });

  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  const team = await prisma.team.create({
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
      staffs:
        body.staffs?.length > 0
          ? {
              create: (body.staffs as Staff[]).map((it) => ({
                name: it.name,
              })),
            }
          : undefined,
    },
    include: {
      players: true,
      staffs: true,
    },
  });

  return NextResponse.json(team, { status: 201 });
}
