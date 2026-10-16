import { CompetitionConfig } from "@/generated/prisma";
import {
  KNOCKOUT_ROUND_OPTIONS,
  KNOCKOUT_ROUNDS,
  KNOCKOUT_STAGES_BY_QUALIFIED,
  REGULAR_ROUND_LABEL_PREFIX,
} from "@/constants/competition";
import { CompetitionBEResponse } from "@/types/competition";

export function getCompetitionRoundOptions(
  competitions: CompetitionBEResponse[],
) {
  const regularRoundCount = competitions.reduce((maxRounds, competition) => {
    const teamCount =
      competition._count?.teams ?? competition.teams?.length ?? 0;

    if (competition.config === CompetitionConfig.LEAGUE) {
      return Math.max(
        maxRounds,
        competition.opponents ?? Math.max(teamCount - 1, 0),
      );
    }

    const teamsPerGroup = competition.opponents ?? teamCount;

    if (teamCount < 2 || teamsPerGroup < 2) {
      return maxRounds;
    }

    const groupCount = Math.ceil(teamCount / teamsPerGroup);
    const baseGroupSize = Math.floor(teamCount / groupCount);
    const maxGroupSize = baseGroupSize + (teamCount % groupCount > 0 ? 1 : 0);
    const roundsPerGroup =
      maxGroupSize % 2 === 0 ? maxGroupSize - 1 : maxGroupSize;

    return Math.max(maxRounds, roundsPerGroup);
  }, 0);

  return [
    ...Array.from({ length: regularRoundCount }, (_, index) => {
      const round = `${REGULAR_ROUND_LABEL_PREFIX} ${index + 1}`;
      return { value: round, label: round };
    }),
    ...KNOCKOUT_ROUND_OPTIONS.map((round) => ({ value: round, label: round })),
  ];
}

export function canCreateKnockout(qualified: number) {
  return Object.prototype.hasOwnProperty.call(
    KNOCKOUT_STAGES_BY_QUALIFIED,
    qualified,
  );
}

export function getCompetitionStages(qualified: number) {
  return KNOCKOUT_STAGES_BY_QUALIFIED[qualified] ?? [];
}

export function isKnockoutRound(round: string) {
  return KNOCKOUT_ROUNDS.has(round);
}
