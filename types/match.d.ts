import { Competition, MatchEvent, MatchStatus, Team } from "@/generated/prisma";
import { TeamBEResponse } from "./team";
import { CompetitionBEResponse } from "./competition";
import { MatchEventBEResponse } from "./match-event";

export type IMatchFormValues = {
  date: string;
  round: string;
  competitionId: number;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
};

export type MatchBEResponse = {
  id: number;
  date: string;
  group?: string | null;
  round: string;
  competitionId: number;
  competition: CompetitionBEResponse;
  homeTeamId?: number | null;
  homeTeam?: TeamBEResponse;
  awayTeamId?: number | null;
  awayTeam?: TeamBEResponse;
  homePlaceholder?: string;
  awayPlaceholder?: string;
  events?: MatchEventBEResponse[];
  status: MatchStatus;
};

export type MatchForPlaceholders = {
  round: string;
  group?: string | null;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
};

export type RoundMatch = {
  home: Team;
  away: Team;
};
