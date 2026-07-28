import { MATCH_STATE_MACHINE } from "@/enums/matches";
import { MatchStatus } from "@/generated/prisma";

export function canTransition(from: MatchStatus, to: MatchStatus) {
  return MATCH_STATE_MACHINE[from].includes(to);
}
