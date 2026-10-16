export const COMPETITION_SCHEDULE = {
  firstMatchHour: 18,
  matchesPerDay: 3,
  matchIntervalMinutes: 60,
  restDaysBetweenKnockoutRounds: 1,
} as const;

export const LEAGUE_POINTS = {
  win: 3,
  draw: 1,
} as const;

export const REGULAR_ROUND_LABEL_PREFIX = "Jornada";

export const KNOCKOUT_STAGES_BY_QUALIFIED: Record<number, string[]> = {
  2: ["Final"],
  4: ["1/2 final", "Final"],
  8: ["1/4 final", "1/2 final", "Final"],
  16: ["1/8 final", "1/4 final", "1/2 final", "Final"],
  32: ["1/16 final", "1/8 final", "1/4 final", "1/2 final", "Final"],
};

export const KNOCKOUT_ROUND_OPTIONS = [
  ...new Set(
    Object.entries(KNOCKOUT_STAGES_BY_QUALIFIED)
      .sort(
        ([qualifiedA], [qualifiedB]) => Number(qualifiedB) - Number(qualifiedA),
      )
      .flatMap(([, stages]) => stages),
  ),
];

export const KNOCKOUT_BRACKET_SEEDS: Record<number, number[]> = {
  2: [1, 2],
  4: [1, 4, 2, 3],
  8: [1, 8, 4, 5, 2, 7, 3, 6],
  16: [1, 16, 8, 9, 5, 12, 4, 13, 3, 14, 6, 11, 7, 10, 2, 15],
  32: [
    1, 32, 16, 17, 8, 25, 9, 24, 5, 28, 12, 21, 13, 20, 4, 29, 3, 30, 14, 19,
    11, 22, 6, 27, 7, 26, 10, 23, 15, 18, 2, 31,
  ],
};

export const KNOCKOUT_ROUNDS = new Set(
  Object.values(KNOCKOUT_STAGES_BY_QUALIFIED).flat(),
);
