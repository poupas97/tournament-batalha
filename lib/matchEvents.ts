import { MatchEventType, MatchStatus } from "@/generated/prisma";

const penaltyMatchEventTypes: MatchEventType[] = [
  MatchEventType.PENALTY_GOAL,
  MatchEventType.YELLOW_CARD,
  MatchEventType.RED_CARD,
];

const eventAllowedStatuses: MatchStatus[] = [
  MatchStatus.RT_START,
  MatchStatus.RT_HALF_TIME,
  MatchStatus.RT_RESTART,
  MatchStatus.ET_START,
  MatchStatus.ET_HALF_TIME,
  MatchStatus.ET_RESTART,
  MatchStatus.ET_END,
  MatchStatus.PENALTIES_START,
];

export function isEventAllowedStatuses(status: MatchStatus) {
  return eventAllowedStatuses.includes(status);
}

export function getAvailableMatchEventTypes(status: MatchStatus) {
  return status === MatchStatus.PENALTIES_START
    ? penaltyMatchEventTypes
    : Object.values(MatchEventType);
}

export function isMatchEventTypeAllowed(
  status: MatchStatus,
  type: MatchEventType,
) {
  return getAvailableMatchEventTypes(status).includes(type);
}
