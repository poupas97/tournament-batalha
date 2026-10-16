import { MatchStatus } from "@/generated/prisma";

export const MATCH_STATE_MACHINE: Record<MatchStatus, MatchStatus[]> = {
  [MatchStatus.SCHEDULED]: [
    MatchStatus.RT_START,
    MatchStatus.POSTPONED,
    MatchStatus.CANCELED,
  ],

  [MatchStatus.RT_START]: [
    MatchStatus.RT_HALF_TIME,
    MatchStatus.INTERRUPTED,
    MatchStatus.POSTPONED,
    MatchStatus.CANCELED,
  ],

  [MatchStatus.RT_HALF_TIME]: [
    MatchStatus.RT_RESTART,
    MatchStatus.INTERRUPTED,
    MatchStatus.POSTPONED,
    MatchStatus.CANCELED,
  ],

  [MatchStatus.RT_RESTART]: [
    MatchStatus.RT_END,
    MatchStatus.INTERRUPTED,
    MatchStatus.POSTPONED,
    MatchStatus.CANCELED,
  ],

  [MatchStatus.RT_END]: [
    MatchStatus.ET_START,
    MatchStatus.PENALTIES_START,
    MatchStatus.CANCELED,
  ],

  [MatchStatus.ET_START]: [
    MatchStatus.ET_HALF_TIME,
    MatchStatus.INTERRUPTED,
    MatchStatus.POSTPONED,
    MatchStatus.CANCELED,
  ],

  [MatchStatus.ET_HALF_TIME]: [
    MatchStatus.ET_RESTART,
    MatchStatus.INTERRUPTED,
    MatchStatus.POSTPONED,
    MatchStatus.CANCELED,
  ],

  [MatchStatus.ET_RESTART]: [
    MatchStatus.ET_END,
    MatchStatus.INTERRUPTED,
    MatchStatus.POSTPONED,
    MatchStatus.CANCELED,
  ],

  [MatchStatus.ET_END]: [MatchStatus.PENALTIES_START, MatchStatus.CANCELED],

  [MatchStatus.PENALTIES_START]: [
    MatchStatus.PENALTIES_END,
    MatchStatus.INTERRUPTED,
    MatchStatus.POSTPONED,
    MatchStatus.CANCELED,
  ],

  [MatchStatus.PENALTIES_END]: [],

  [MatchStatus.INTERRUPTED]: [
    MatchStatus.RT_START,
    MatchStatus.RT_RESTART,
    MatchStatus.ET_START,
    MatchStatus.ET_RESTART,
    MatchStatus.PENALTIES_START,
    MatchStatus.CANCELED,
  ],

  [MatchStatus.POSTPONED]: [MatchStatus.CANCELED],

  [MatchStatus.CANCELED]: [],
};
