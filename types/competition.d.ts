import { CompetitionConfig, Team } from "@/generated/prisma";

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
  teams: Team[];
  config: CompetitionConfig;
  qualified?: number;
  opponents?: number;
  active?: boolean;
};
