import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { requireToken, unauthorized } from "@/lib/api";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { teams: true },
      },
    },
  });

  return NextResponse.json(competitions);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  const competition = await prisma.competition.create({
    data: {
      name,
    },
    include: {
      teams: true,
    },
  });

  return NextResponse.json(competition, { status: 201 });
}
