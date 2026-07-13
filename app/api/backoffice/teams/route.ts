import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import { Player, Staff } from "@/generated/prisma";
import { requireToken } from "@/lib/token";
import { unauthorized } from "@/lib/api";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      competition: true,
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
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";
  const competitionId = sanitizeNumber(body.competitionId);

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  if (!competitionId) {
    return NextResponse.json(
      { error: "Competição inválida." },
      { status: 400 },
    );
  }

  const team = await prisma.team.create({
    data: {
      name,
      competitionId,
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
