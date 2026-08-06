import { CompetitionConfig } from "@/generated/prisma";
import { TeamBEResponse } from "./team";

export type ICompetitionFormValues = {
  name: string;
  config: CompetitionConfig;
  qualified?: number;
  opponents?: number;
  active?: boolean;
};

export type CompetitionBEResponse = {
  id: number;
  name: string;
  teams: TeamBEResponse[];
  config: CompetitionConfig;
  qualified?: number;
  opponents?: number;
  active?: boolean;
  _count?: {
    teams: number;
  };
};

export type LeagueStanding = {
  position: number;
  team: TeamBEResponse;

  played: number;
  won: number;
  drawn: number;
  lost: number;

  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;

  points: number;
};

export type KnockoutSeed = {
  seed: number;
  group?: string;
  standing: LeagueStanding;
};

export type CompetitionShuffleGroup = {
  group?: string;
  standings: LeagueStanding[];
  matches: MatchBEResponse[];
};

export type CompetitionForShuffle = {
  config: CompetitionConfig;
  qualified?: number | null;
  teams: TeamBEResponse[];
};
