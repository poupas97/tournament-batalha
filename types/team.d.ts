import { Competition, Player, Staff } from "@/generated/prisma";
import { CompetitionBEResponse } from "./competition";
import { MatchBEResponse } from "./match";

export type IStaffFormValues = {
  id: number;
  name: string;
};

export type IPlayerFormValues = {
  id: number;
  name: string;
  number: number;
};

export type ITeamFormValues = {
  name: string;
  players: IPlayerFormValues[];
  staffs: IStaffFormValues[];
  competitionId: Competition["id"];
};

export type TeamBEResponse = {
  id: number;
  name: string;
  players: Player[];
  staffs: Staff[];
  competitionId: Competition["id"];
  competition: CompetitionBEResponse;
  awayMatches?: MatchBEResponse[];
  homeMatches?: MatchBEResponse[];
};
