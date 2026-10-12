import { MatchStatus } from "@/generated/prisma";

const eventAllowedStatuses: MatchStatus[] = [
  MatchStatus.RT_START,
  MatchStatus.RT_HALF_TIME,
  MatchStatus.RT_RESTART,
  MatchStatus.RT_END,
  MatchStatus.ET_START,
  MatchStatus.ET_HALF_TIME,
  MatchStatus.ET_RESTART,
  MatchStatus.ET_END,
  MatchStatus.PENALTIES,
];

export function isEventAllowedStatuses(status: MatchStatus) {
  return eventAllowedStatuses.includes(status);
}
