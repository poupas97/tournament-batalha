import { Match } from "@/generated/prisma";
import type WebSocket from "ws";

const matchesRooms = new Map<number, Set<WebSocket>>();

export function joinMatch(matchId: Match["id"], ws: WebSocket) {
  let room = matchesRooms.get(matchId);

  if (!room) {
    room = new Set();
    matchesRooms.set(matchId, room);
  }

  room.add(ws);

  console.log(`Match ${matchId}: ${room.size} clients`);
}

export function leaveMatch(matchId: Match["id"], ws: WebSocket) {
  const room = matchesRooms.get(matchId);

  if (!room) return;

  room.delete(ws);

  if (room.size === 0) {
    matchesRooms.delete(matchId);
  }

  console.log(`Match ${matchId}: ${room.size} clients`);
}

export function notifyMatch(matchId: Match["id"]) {
  const room = matchesRooms.get(matchId);

  if (!room) return;

  const json = JSON.stringify({ type: "MATCH_UPDATED" });

  for (const client of room) {
    client.send(json);
  }
}
