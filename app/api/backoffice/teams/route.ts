import prisma from "@/lib/prisma";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import { CompetitionStatus } from "@/generated/prisma";
import { sanitizePlayers, sanitizeStaffs } from "@/lib/staff";
import {
  createdResponse,
  getResponse,
  invalidParam,
  requireToken,
  unauthorized,
} from "@/lib/api";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const teams = await prisma.team.findMany({
    orderBy: [{ name: "asc" }, { competition: { name: "asc" } }],
    include: {
      competition: true,
      _count: {
        select: { players: true, staffs: true },
      },
    },
  });

  return getResponse(teams);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name);
  const competitionId = sanitizeNumber(body?.competitionId);
  const players = sanitizePlayers(body?.players);
  const staffs = sanitizeStaffs(body?.staffs);

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  if (!competitionId) {
    return invalidParam("Competition");
  }

  if (players === null) {
    return invalidParam("Players");
  }

  if (staffs === null) {
    return invalidParam("Staffs");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { id: true, status: true },
  });

  if (!competition) {
    return invalidParam("Competition");
  }

  if (competition.status !== CompetitionStatus.DRAFT) {
    return invalidParam("CompetitionStatus");
  }

  const team = await prisma.team.create({
    data: {
      name,
      competitionId,
      players: players?.length ? { create: players } : undefined,
      staffs: staffs?.length ? { create: staffs } : undefined,
    },
    include: {
      players: true,
      staffs: true,
    },
  });

  return createdResponse(team);
}
