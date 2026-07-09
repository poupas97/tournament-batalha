import { Player, Staff } from "@/generated/prisma";

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
  staff: IStaffDraft[];
};

export type TeamBEResponse = {
  id: number;
  name: string;
  players: Player[];
  staff: Staff[];
};
