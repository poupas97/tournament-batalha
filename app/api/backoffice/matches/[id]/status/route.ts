import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireToken } from "@/lib/token";
import { sanitizeEnum } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import { getParamId, unauthorized } from "@/lib/api";
import { MatchStatus } from "@/generated/prisma";

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchId = getParamId(context);
  if (!matchId) {
    return NextResponse.json({ error: "Equipa inválida." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const status = sanitizeEnum(body?.status, MatchStatus);

  if (!status) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      status,
    },
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  return NextResponse.json(match);
}
