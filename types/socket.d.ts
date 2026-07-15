import { Match, MatchEvent } from "@/generated/prisma";

export type NotifyMatchStatus = Pick<Match, "status">;

export type NotifyAddMatchEvent = MatchEvent;

export type NotifyRemoveMatchEvent = Pick<MatchEvent, "id" | "matchId">;
