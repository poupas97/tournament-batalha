import { Team } from "@/generated/prisma";

export type ICompetitionFormValues = {
  name: string;
  teams: Team[];
};

export type CompetitionBEResponse = {
  id: number;
  name: string;
  teams: Team[];
};
