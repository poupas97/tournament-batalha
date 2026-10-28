import prisma from "@/lib/prisma";
import {
  MAX_NAME_LENGTH,
  PLAYER_NUMBER_MIN,
  PLAYER_NUMBER_MAX,
} from "@/constants/validation";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import { CompetitionStatus } from "@/generated/prisma";
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
  const name = sanitizeText(body?.name);
  const number = sanitizeNumber(body?.number);
  const teamId = sanitizeNumber(body?.teamId);

  if (!name || name.length > MAX_NAME_LENGTH) {
    return invalidParam("Name", "name");
  }

  if (!number || number < PLAYER_NUMBER_MIN || number > PLAYER_NUMBER_MAX) {
    return invalidParam("Number", "number");
  }

  if (!teamId) {
    return invalidParam("Team", "teamId");
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, competition: { select: { status: true } } },
  });

  if (!team) {
    return noFound("Team");
  }

  if (team.competition.status !== CompetitionStatus.DRAFT) {
    return invalidParam("CompetitionStatus");
  }

  const player = await prisma.player.create({
    data: { name, number, teamId },
    include: { team: true },
  });

  return createdResponse(player);
}
