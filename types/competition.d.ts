import { CompetitionConfig, CompetitionStatus } from "@/generated/prisma";
import { TeamBEResponse } from "./team";
import { MatchBEResponse } from "./match";

export type ICompetitionFormValues = {
  name: string;
  color: string;
  config: CompetitionConfig;
  startDate: string;
  qualified?: number;
  opponents?: number;
  active?: boolean;
};

export type CompetitionBEResponse = {
  id: number;
  name: string;
  color: string;
  startDate: string;
  status: CompetitionStatus;
  teams: TeamBEResponse[];
  matches?: MatchBEResponse[];
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

type CompetitionStatsBEResponse = {
  rankingScores:
    | {
        position: number;
        playerId: number;
        playerName: string;
        playerPhoto: string | null;
        goals: number;
        teamName: string;
        teamPhoto: string | null;
        matches: number;
      }[]
    | undefined;
};
