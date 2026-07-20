import prisma from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
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

  if (!name || name.length > 100) {
    return invalidParam("Name");
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
    data: {
      name,
    },
    include: {
      teams: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return createdResponse(competitionUpdated);
}
