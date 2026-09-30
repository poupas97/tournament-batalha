import { MATCH_STATE_MACHINE } from "@/enums/matches";
import { Match, MatchStatus } from "@/generated/prisma";
import { isKnockoutRound } from "./shuffle";
import { MatchBEResponse } from "@/types/match";

export function canTransition(match: Match | MatchBEResponse, to: MatchStatus) {
  if (match.status === MatchStatus.RT_END && !isKnockoutRound(match.round)) {
    return false;
  }

  return MATCH_STATE_MACHINE[match.status].includes(to);
}
