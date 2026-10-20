import { CompetitionConfig } from "@/generated/prisma";
import { KNOCKOUT_BRACKET_SEEDS } from "@/constants/competition";
import {
  getCompetitionStages,
  isKnockoutRound,
} from "@/lib/competition/rounds";
import { getRegularMatches } from "@/lib/competition/standings";
import { MatchForPlaceholders } from "@/types/match";

export function addKnockoutPlaceholders<T extends MatchForPlaceholders>({
  config,
  qualified,
  matches,
}: {
  config: CompetitionConfig;
  qualified: number;
  matches: T[];
}) {
  const stages = getCompetitionStages(qualified);
  const regularMatches = getRegularMatches(matches);
  const qualificationSources =
    config === CompetitionConfig.GROUP
      ? createGroupQualificationSources(regularMatches, qualified)
      : createLeagueQualificationSources(qualified);
  const placeholders = createKnockoutPlaceholders(qualificationSources, stages);
  const knockoutIndexes = new Map<string, number>();

  return matches.map((match) => {
    if (!isKnockoutRound(match.round)) {
      return match;
    }

    const index = knockoutIndexes.get(match.round) ?? 0;
    const placeholder = placeholders.get(match.round)?.[index];

    knockoutIndexes.set(match.round, index + 1);

    return {
      ...match,
      homePlaceholder: placeholder?.home,
      awayPlaceholder: placeholder?.away,
    };
  });
}

function createKnockoutPlaceholders(
  qualificationSources: string[],
  stages: string[],
) {
  const placeholders = new Map<string, { home: string; away: string }[]>();

  for (const [stageIndex, stage] of stages.entries()) {
    const matchesInRound =
      stageIndex === 0
        ? Math.floor(qualificationSources.length / 2)
        : Math.floor(
            (placeholders.get(stages[stageIndex - 1])?.length ?? 0) / 2,
          );

    placeholders.set(
      stage,
      Array.from({ length: matchesInRound }, (_, index) => {
        const seedIndex = index * 2;

        if (stageIndex === 0) {
          return {
            home: qualificationSources[seedIndex] ?? "-",
            away: qualificationSources[seedIndex + 1] ?? "-",
          };
        }

        const previousStage = stages[stageIndex - 1];
        const previousMatch = index * 2 + 1;

        return {
          home: `Vencedor ${previousStage} ${previousMatch}`,
          away: `Vencedor ${previousStage} ${previousMatch + 1}`,
        };
      }),
    );
  }

  return placeholders;
}

function createGroupQualificationSources(
  matches: MatchForPlaceholders[],
  qualified: number,
) {
  const groupTeams = new Map<string, Set<number>>();
  const sources: string[] = [];
  let position = 1;

  for (const match of matches) {
    if (!match.group) continue;

    const teams = groupTeams.get(match.group) ?? new Set<number>();

    if (match.homeTeamId) teams.add(match.homeTeamId);
    if (match.awayTeamId) teams.add(match.awayTeamId);

    groupTeams.set(match.group, teams);
  }

  const groups = [...groupTeams.keys()].sort();

  while (sources.length < qualified) {
    const currentPositionSources = groups
      .filter((group) => (groupTeams.get(group)?.size ?? 0) >= position)
      .map((group) => `${position}.º Grupo ${group}`);

    if (!currentPositionSources.length) break;

    sources.push(...currentPositionSources);
    position++;
  }

  const order = KNOCKOUT_BRACKET_SEEDS[qualified] ?? [];

  return order.map((seed) => sources[seed - 1]);
}

function createLeagueQualificationSources(qualified: number) {
  return (KNOCKOUT_BRACKET_SEEDS[qualified] ?? []).map(
    (seed) => `${seed}.º classificado`,
  );
}
