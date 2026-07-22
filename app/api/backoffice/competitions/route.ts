import prisma from "@/lib/prisma";
import { sanitizeEnum, sanitizeNumber, sanitizeText } from "@/lib/sanitize";
import {
  createdResponse,
  getResponse,
  invalidParam,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { CompetitionConfig } from "@/generated/prisma";

export async function GET(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { teams: true },
      },
    },
  });

  return getResponse(competitions);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";
  const config = sanitizeEnum(body?.config, CompetitionConfig);
  const qualified = sanitizeNumber(body?.qualified);
  const opponents = sanitizeNumber(body?.opponents);

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

  const competition = await prisma.competition.create({
    data: { name, config, qualified, opponents },
    include: {
      teams: true,
    },
  });

  return createdResponse(competition);
}
