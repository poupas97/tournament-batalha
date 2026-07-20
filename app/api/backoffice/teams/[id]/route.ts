import prisma from "@/lib/prisma";
import { Player, Staff } from "@/generated/prisma";
import { sanitizeText } from "@/lib/sanitize";
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
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  const existing = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true },
  });

  if (!existing) {
    return noFound("Team");
  }

  const teamUpdated = await prisma.$transaction(async (tx) => {
    await tx.player.deleteMany({ where: { teamId } });
    await tx.staff.deleteMany({ where: { teamId } });

    return tx.team.update({
      where: { id: teamId },
      data: {
        name,
        players:
          body.players?.length > 0
            ? {
                create: (body.players as Player[]).map((it) => ({
                  name: it.name,
                  number: it.number,
                })),
              }
            : undefined,
        staffs:
          body.staffs?.length > 0
            ? {
                create: (body.staffs as Staff[]).map((it) => ({
                  name: it.name,
                })),
              }
            : undefined,
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
