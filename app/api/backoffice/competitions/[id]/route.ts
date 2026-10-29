import prisma from "@/lib/prisma";
import { MAX_NAME_LENGTH } from "@/constants/validation";
import {
  sanitizeBoolean,
  sanitizeColor,
  sanitizeDate,
  sanitizeEnum,
  sanitizeNumber,
  sanitizeText,
} from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import {
  conflict,
  createdResponse,
  deletedResponse,
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
} from "@/lib/api";
import {
  AuditAction,
  CompetitionConfig,
  CompetitionStatus,
} from "@/generated/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const competitionId = await getParamId(context);
  if (!competitionId) {
    return invalidParam("Competition");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      teams: {
        orderBy: { createdAt: "asc" },
        include: {
          _count: { select: { players: true, staffs: true } },
        },
      },
      _count: { select: { teams: true } },
    },
  });

  if (!competition) {
    return noFound("Competition");
  }

  return getResponse(competition);
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const competitionId = await getParamId(context);
  if (!competitionId) {
    return invalidParam("Competition");
  }

  const existing = await prisma.competition.findUnique({
    where: { id: competitionId, deletedAt: null },
  });

  if (!existing) {
    return noFound("Competition");
  }

  if (existing.status !== CompetitionStatus.DRAFT) {
    return invalidParam("CompetitionStatus");
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name) || existing.name;
  const color = sanitizeColor(body?.color) || existing.color;
  const config =
    sanitizeEnum(body?.config, CompetitionConfig) || existing.config;
  const startDate =
    body?.startDate === undefined
      ? existing.startDate
      : sanitizeDate(body.startDate);
  const qualified = sanitizeNumber(body?.qualified) || existing.qualified;
  const opponents = sanitizeNumber(body?.opponents) || existing.opponents;
  const active =
    sanitizeBoolean(body?.active) !== undefined
      ? sanitizeBoolean(body?.active)
      : existing.active;

  if (!name || name.length > MAX_NAME_LENGTH) {
    return invalidParam("Name", "name");
  }

  if (!config) {
    return invalidParam("CompetitionConfig", "config");
  }

  if (!startDate) {
    return invalidParam("StartDate", "startDate");
  }

  if (!color) {
    return invalidParam("Color", "color");
  }

  const colorInUse = await prisma.competition.findFirst({
    where: { color, id: { not: competitionId } },
  });
  if (colorInUse) {
    return conflict("Color", "color");
  }

  const competitionUpdated = await prisma.competition.update({
    where: { id: competitionId },
    data: { name, color, config, startDate, qualified, opponents, active },
    include: {
      teams: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return createdResponse(competitionUpdated);
}

export async function DELETE(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) return unauthorized();

  const competitionId = await getParamId(context);
  if (!competitionId) return invalidParam("Competition");

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId, deletedAt: null },
  });
  if (!competition) return noFound("Competition");

  await prisma.$transaction(async (tx) => {
    const deleted = await tx.competition.update({
      where: { id: competitionId },
      data: { deletedAt: new Date() },
    });

    await createAuditLog(
      {
        token,
        action: AuditAction.DELETE,
        entity: "Competition",
        entityId: competitionId,
        before: competition,
        after: deleted,
      },
      tx,
    );
  });

  return deletedResponse();
}
