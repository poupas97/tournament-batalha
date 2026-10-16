import prisma from "@/lib/prisma";
import {
  sanitizeColor,
  sanitizeEnum,
  sanitizeNumber,
  sanitizeText,
} from "@/lib/sanitize";
import {
  conflict,
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
  const name = sanitizeText(body?.name);
  const color = sanitizeColor(body?.color);
  const config = sanitizeEnum(body?.config, CompetitionConfig);
  const qualified = sanitizeNumber(body?.qualified);
  const opponents = sanitizeNumber(body?.opponents);

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  if (!config) {
    return invalidParam("CompetitionConfig");
  }

  if (!color) {
    return invalidParam("Color");
  }

  const colorInUse = await prisma.competition.findUnique({ where: { color } });
  if (colorInUse) {
    return conflict("Color");
  }

  const competition = await prisma.competition.create({
    data: { name, color, config, qualified, opponents },
    include: { teams: true },
  });

  return createdResponse(competition);
}
