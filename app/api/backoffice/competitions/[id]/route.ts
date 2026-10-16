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
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { CompetitionConfig, CompetitionStatus } from "@/generated/prisma";

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
    where: { id: competitionId },
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
    return invalidParam("Name");
  }

  if (!config) {
    return invalidParam("CompetitionConfig");
  }

  if (!startDate) {
    return invalidParam("StartDate");
  }

  if (!color) {
    return invalidParam("Color");
  }

  const colorInUse = await prisma.competition.findFirst({
    where: { color, id: { not: competitionId } },
  });
  if (colorInUse) {
    return conflict("Color");
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
