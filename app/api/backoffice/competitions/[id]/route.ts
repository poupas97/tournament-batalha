import prisma from "@/lib/prisma";
import {
  sanitizeBoolean,
  sanitizeEnum,
  sanitizeNumber,
  sanitizeText,
} from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import {
  createdResponse,
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { CompetitionConfig } from "@/generated/prisma";

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
      },
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

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";
  const config = sanitizeEnum(body?.config, CompetitionConfig);
  const qualified = sanitizeNumber(body?.qualified);
  const opponents = sanitizeNumber(body?.opponents);
  const active = sanitizeBoolean(body?.active);

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  if (!config) {
    return invalidParam("CompetitionConfig");
  }

  if (!qualified) {
    return invalidParam("Qualifed");
  }

  if (!opponents) {
    return invalidParam("Opponents");
  }

  const existing = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { id: true },
  });

  if (!existing) {
    return noFound("Competition");
  }

  const competitionUpdated = await prisma.competition.update({
    where: { id: competitionId },
    data: { name, config, qualified, opponents, active },
    include: {
      teams: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return createdResponse(competitionUpdated);
}
