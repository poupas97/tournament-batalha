import prisma from "@/lib/prisma";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import {
  createdResponse,
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
} from "@/lib/api";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const players = await prisma.player.findMany({
    orderBy: { createdAt: "desc" },
    include: { team: true },
  });

  return getResponse(players);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body.name);
  const number = sanitizeText(body.number);
  const teamId = sanitizeNumber(body?.teamId);

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  if (!number || Number(number) < 0 || Number(number) > 99) {
    return invalidParam("Number");
  }

  if (!teamId) {
    return invalidParam("Team");
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true },
  });

  if (!team) {
    return noFound("Team");
  }

  const player = await prisma.player.create({
    data: { name, number, teamId },
    include: { team: true },
  });

  return createdResponse(player);
}
