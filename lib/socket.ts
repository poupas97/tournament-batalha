import { Match } from "@/generated/prisma";
import { SocketEvents } from "@/enums/socket";
import {
  NotifyAddMatchEvent,
  NotifyMatchStatus,
  NotifyRemoveMatchEvent,
} from "@/types/socket";

export interface SocketClient {
  send(data: string): void;
}

const matchesRooms = new Map<Match["id"], Set<SocketClient>>();

export function joinMatch(matchId: Match["id"], client: SocketClient) {
  let room = matchesRooms.get(matchId);

  if (!room) {
    room = new Set();
    matchesRooms.set(matchId, room);
  }

  room.add(client);

  console.log(`Match ${matchId}: ${room.size} clients`);
}

export function leaveMatch(matchId: Match["id"], client: SocketClient) {
  const room = matchesRooms.get(matchId);

  if (!room) return;

  room.delete(client);

  if (room.size === 0) {
    matchesRooms.delete(matchId);
  }

  console.log(`Match ${matchId}: ${room.size} clients`);
}

function notifyMatch<T>(matchId: Match["id"], type: SocketEvents, payload: T) {
  const room = matchesRooms.get(matchId);

  if (!room) return;

  const json = JSON.stringify({ type, payload });

  for (const client of room) {
    client.send(json);
  }

  console.log(`${type}; Match ${matchId}; ${room.size} clients`);
}

export function notifyMatchStatus(
  matchId: Match["id"],
  payload: NotifyMatchStatus,
) {
  notifyMatch(matchId, SocketEvents.MATCH_STATUS, payload);
}

export function notifyAddMatchEvent(
  matchId: Match["id"],
  payload: NotifyAddMatchEvent,
) {
  notifyMatch(matchId, SocketEvents.ADD_MATCH_EVENT, payload);
}

export function notifyRemoveMatchEvent(
  matchId: Match["id"],
  payload: NotifyRemoveMatchEvent,
) {
  notifyMatch(matchId, SocketEvents.REMOVE_MATCH_EVENT, payload);
}
