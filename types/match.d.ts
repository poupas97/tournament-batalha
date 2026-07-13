import { MatchStatus, Team } from "@/generated/prisma";
import { TeamBEResponse } from "./team";

export type IMatchFormValues = {
  date: string;
  round: string;
  competitionId: number;
  homeTeamId?: number;
  awayTeamId?: number;
};

export type MatchBEResponse = {
  date: string;
  round: string;
  competitionId: number;
  homeTeamId?: number;
  homeTeam?: TeamBEResponse;
  awayTeamId?: number;
  awayTeam?: TeamBEResponse;
  events?: MatchEvent[];
  status: MatchStatus;
};
