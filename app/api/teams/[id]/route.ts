import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

function getTeamId(id: string) {
  const teamId = Number(id);
  return Number.isInteger(teamId) && teamId > 0 ? teamId : null;
}

export async function GET(request: Request, { params }: RouteContext) {
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
