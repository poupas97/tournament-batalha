import prisma from "@/lib/prisma";
import { CompetitionStatus, MatchStatus } from "@/generated/prisma";
import { sanitizeEnum } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import {
  getParamId,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
  updatedResponse,
} from "@/lib/api";

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
  const status = sanitizeEnum(body?.status, CompetitionStatus);

  if (!status) {
    return invalidParam("Status");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { id: true, status: true },
  });

  if (!competition) {
    return noFound("Competition");
  }

  if (status === CompetitionStatus.IN_PROGRESS) {
    if (competition.status !== CompetitionStatus.DRAWN) {
      return invalidParam("CompetitionStatus");
    }

    const matches = await prisma.match.count({ where: { competitionId } });
    if (matches === 0) {
      return invalidParam("Matches");
    }
  } else if (status === CompetitionStatus.FINISHED) {
    if (competition.status !== CompetitionStatus.IN_PROGRESS) {
      return invalidParam("CompetitionStatus");
    }

    const pendingMatches = await prisma.match.count({
      where: {
        competitionId,
        status: {
          notIn: [
            MatchStatus.RT_END,
            MatchStatus.ET_END,
            MatchStatus.PENALTIES,
            MatchStatus.CANCELED,
          ],
        },
      },
    });

    if (pendingMatches > 0) {
      return invalidParam("Matches");
    }
  } else {
    return invalidParam("CompetitionStatus");
  }

  const updatedCompetition = await prisma.competition.update({
    where: { id: competitionId },
    data: { status },
  });

  return updatedResponse(updatedCompetition);
}
