import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitizeEnum } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import { getParamId, requireToken, unauthorized } from "@/lib/api";
import { MatchStatus } from "@/generated/prisma";
import { notifyMatchStatus } from "@/lib/socket";

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchId = await getParamId(context);
  if (!matchId) {
    return NextResponse.json({ error: "Jogo inválido." }, { status: 400 });
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

  notifyMatchStatus(matchId, { status: match.status });

  return NextResponse.json(match);
}
