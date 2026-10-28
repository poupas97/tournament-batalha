import prisma from "@/lib/prisma";
import { MAX_NAME_LENGTH } from "@/constants/validation";
import {
  sanitizeColor,
  sanitizeDate,
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
  const startDate = sanitizeDate(body?.startDate);
  const qualified = sanitizeNumber(body?.qualified);
  const opponents = sanitizeNumber(body?.opponents);

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

  const colorInUse = await prisma.competition.findUnique({ where: { color } });
  if (colorInUse) {
    return conflict("Color", "color");
  }

  const competition = await prisma.competition.create({
    data: { name, color, config, startDate, qualified, opponents },
    include: { teams: true },
  });

  return createdResponse(competition);
}
