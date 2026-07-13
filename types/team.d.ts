import { Competition, Player, Staff } from "@/generated/prisma";
import { CompetitionBEResponse } from "./competition";

export type IStaffDraft = {
  id: number;
  name: string;
};

export type IPlayerDraft = {
  id: number;
  name: string;
  number: string;
};

export type ITeamFormValues = {
  name: string;
  players: IPlayerDraft[];
  staffs: IStaffDraft[];
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
