import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireToken } from "@/lib/token";
import { sanitizeText } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import { getParamId, unauthorized } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const competitionId = await getParamId(context);
  if (!competitionId) {
    return NextResponse.json(
      { error: "Competição inválida." },
      { status: 400 },
    );
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      teams: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!competition) {
    return NextResponse.json(
      { error: "Competição não encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json(competition);
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const competitionId = await getParamId(context);
  if (!competitionId) {
    return NextResponse.json({ error: "Equipa inválida." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  const existingTeam = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { id: true },
  });

  if (!existingTeam) {
    return NextResponse.json(
      { error: "Equipa não encontrada." },
      { status: 404 },
    );
  }

  const competition = await prisma.competition.update({
    where: { id: competitionId },
    data: {
      name,
    },
    include: {
      teams: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(competition);
}
