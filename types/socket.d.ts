import { Match, MatchEvent } from "@/generated/prisma";
import { MatchEventBEResponse } from "./match-event";

export type NotifyMatchStatus = Pick<Match, "status">;

export type NotifyAddMatchEvent = MatchEventBEResponse;

export type NotifyRemoveMatchEvent = Pick<MatchEvent, "id" | "matchId">;
