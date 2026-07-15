import { Match } from "@/generated/prisma";
import { SocketEvents } from "@/enums/socket";
import type WebSocket from "ws";

const matchesRooms = new Map<number, Set<WebSocket>>();

export function joinMatch(matchId: Match["id"], ws: WebSocket) {
  let room = matchesRooms.get(matchId);

  if (!room) {
    room = new Set();
    matchesRooms.set(matchId, room);
  }

  room.add(ws);

  console.log(`Match ${matchId}; JOIN; ${room.size} clients`);
}

export function leaveMatch(matchId: Match["id"], ws: WebSocket) {
  const room = matchesRooms.get(matchId);

  if (!room) return;

  room.delete(ws);

  if (room.size === 0) {
    matchesRooms.delete(matchId);
  }

  console.log(`Match ${matchId}; LEAVE; ${room.size} clients`);
}

export function notifyMatchStatus(
  matchId: Match["id"],
  payload: Pick<Match, "status">,
) {
  const room = matchesRooms.get(matchId);

  if (!room) return;

  const json = JSON.stringify({ type: SocketEvents.MATCH_STATUS, payload });

  for (const client of room) {
    client.send(json);
  }

  console.log(`Match ${matchId}; STATUS; ${room.size} clients`);
}
