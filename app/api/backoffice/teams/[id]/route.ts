import prisma from "@/lib/prisma";
import { CompetitionStatus } from "@/generated/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { sanitizePlayers, sanitizeStaffs } from "@/lib/staff";
import { RouteContext } from "@/types/api";
import {
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
  updatedResponse,
} from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const teamId = await getParamId(context);
  if (!teamId) {
    return invalidParam("Team");
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
    return noFound("Team");
  }

  return getResponse(team);
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const teamId = await getParamId(context);
  if (!teamId) {
    return invalidParam("Team");
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name);
  const players = sanitizePlayers(body?.players);
  const staffs = sanitizeStaffs(body?.staffs);

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  if (players === null) {
    return invalidParam("Players");
  }

  if (staffs === null) {
    return invalidParam("Staffs");
  }

  const existing = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, competition: { select: { status: true } } },
  });

  if (!existing) {
    return noFound("Team");
  }

  if (existing.competition.status !== CompetitionStatus.DRAFT) {
    return invalidParam("CompetitionStatus");
  }

  const teamUpdated = await prisma.$transaction(async (tx) => {
    await tx.player.deleteMany({ where: { teamId } });
    await tx.staff.deleteMany({ where: { teamId } });

    return tx.team.update({
      where: { id: teamId },
      data: {
        name,
        players: players?.length ? { create: players } : undefined,
        staffs: staffs?.length ? { create: staffs } : undefined,
      },
      include: {
        players: {
          orderBy: { createdAt: "asc" },
        },
        staffs: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  });

  return updatedResponse(teamUpdated);
}
