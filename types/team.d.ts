import {
  Competition,
  MatchEvent,
  Player,
  Staff,
  Team,
} from "@/generated/prisma";
import { CompetitionBEResponse } from "./competition";
import { MatchBEResponse } from "./match";

export type IStaffFormValues = {
  id: number;
  name: string;
  photo?: string | null;
};

export type IPlayerFormValues = {
  id: number;
  name: string;
  number: number;
  photo?: string | null;
};

export type IPlayerEditValues = {
  name: string;
  number: number;
  photo?: string | null;
  teamId: number;
};

export type ITeamFormValues = {
  name: string;
  photo?: string | null;
  pot: number;
  players: IPlayerFormValues[];
  staffs: IStaffFormValues[];
  competitionId: Competition["id"];
};

export type TeamBEResponse = {
  id: number;
  name: string;
  photo?: string | null;
  pot: number;
  players: Player[];
  staffs: Staff[];
  competitionId: Competition["id"];
  competition: CompetitionBEResponse;
  awayMatches?: MatchBEResponse[];
  homeMatches?: MatchBEResponse[];
  _count?: {
    players: number;
    staffs: number;
  };
  deletedAt: string | null;
};

export type PlayerEventBEResponse = MatchEvent & {
  match: {
    id: number;
    date: string;
    round: string;
    competition: Pick<Competition, "name">;
    homeTeam: Pick<Team, "name"> | null;
    awayTeam: Pick<Team, "name"> | null;
  };
};

export type PlayerBEResponse = Player & {
  team: Team & { competition: Competition };
  events: PlayerEventBEResponse[];
};
