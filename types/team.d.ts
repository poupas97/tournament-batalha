import { Competition, Player, Staff } from "@/generated/prisma";
import { CompetitionBEResponse } from "./competition";

export type IStaffFormValues = {
  id: number;
  name: string;
};

export type IPlayerFormValues = {
  id: number;
  name: string;
  number: string;
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
};
