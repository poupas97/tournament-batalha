import prisma from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
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

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  const competition = await prisma.competition.create({
    data: {
      name,
    },
    include: {
      teams: true,
    },
  });

  return createdResponse(competition);
}
