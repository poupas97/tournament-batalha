import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import { getParamId } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const teamId = await getParamId(context);
  if (!teamId) {
    return NextResponse.json({ error: "Equipa inválida." }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      competition: true,
      players: {
        orderBy: { createdAt: "asc" },
      },
      staffs: {
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
