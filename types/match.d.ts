import { Team } from "@/generated/prisma";

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
  awayTeamId?: number;
};
