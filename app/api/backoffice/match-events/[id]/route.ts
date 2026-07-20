import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import {
  deletedResponse,
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { notifyRemoveMatchEvent } from "@/lib/socket";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchEventId = await getParamId(context);
  if (!matchEventId) {
    return invalidParam("Match event");
  }

  const matchEvent = await prisma.matchEvent.findUnique({
    where: { id: matchEventId },
    include: {
      player: true,
      staff: true,
      team: true,
    },
  });

  if (!matchEvent) {
    return noFound("Match event");
  }

  return getResponse(matchEvent);
}

export async function DELETE(request: Request, context: RouteContext) {
  const token = await requireToken(request);
  if (!token) {
    return unauthorized();
  }

  const matchEventId = await getParamId(context);
  if (!matchEventId) {
    return invalidParam("Match event");
  }

  const matchEvent = await prisma.matchEvent.findUnique({
    where: { id: matchEventId },
    select: { id: true, matchId: true },
  });

  if (!matchEvent) {
    return noFound("Match event");
  }

  await prisma.matchEvent.delete({
    where: { id: matchEventId },
  });

  notifyRemoveMatchEvent(matchEvent.matchId, matchEvent);

  return deletedResponse();
}
