import { Match, MatchEventType, Player, Staff, Team } from "@/generated/prisma";

export type IMatchEventFormValues = {
  id: number;
  matchId: number;
  teamId?: number;
  playerId?: number;
  staffId?: number;
  minute?: number;
  type: MatchEventType;
};

export type MatchEventBEResponse = {
  id: number;
  matchId: number;
  match: Match;
  teamId?: number;
  team?: Team;
  playerId?: number;
  player?: Player;
  staffId?: number;
  staff?: Staff;
  minute?: number;
  type: MatchEventType;
};
