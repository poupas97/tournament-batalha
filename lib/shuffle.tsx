import {
  CompetitionConfig,
  MatchEventType,
  MatchStatus,
  Prisma,
  Team,
} from "@/generated/prisma";
import { KnockoutSeed, LeagueStanding } from "@/types/competition";
import { MatchBEResponse } from "@/types/match";
import { TeamBEResponse } from "@/types/team";

const stagesByQualified: Record<number, string[]> = {
  2: ["Final"],
  4: ["1/2 final", "Final"],
  8: ["1/4 final", "1/2 final", "Final"],
  16: ["1/8 final", "1/4 final", "1/2 final", "Final"],
  32: ["1/16 final", "1/8 final", "1/4 final", "1/2 final", "Final"],
};

const knockoutRounds = new Set(Object.values(stagesByQualified).flat());

type CompetitionForShuffle = {
  config: CompetitionConfig;
  qualified?: number | null;
  teams: TeamBEResponse[];
};

export type CompetitionShuffleGroup = {
  group?: string;
  standings: LeagueStanding[];
  matches: MatchBEResponse[];
};

export function canCreateLeague(numberOfTeams: number, opponents: number) {
  return (
    numberOfTeams >= 2 &&
    opponents >= 1 &&
    opponents < numberOfTeams &&
    (numberOfTeams * opponents) % 2 === 0
  );
}

export function createGroupMatches(
  competitionId: number,
  teams: Team[],
  teamsPerGroup: number,
): Prisma.MatchCreateManyInput[] {
  const matches: Prisma.MatchCreateManyInput[] = [];

  const shuffled = [...teams].sort(() => Math.random() - 0.5);

  const numberOfGroups = Math.ceil(shuffled.length / teamsPerGroup);
  const baseSize = Math.floor(shuffled.length / numberOfGroups);
  const remainder = shuffled.length % numberOfGroups;

  const groups: Team[][] = [];

  let index = 0;

  for (let groupIndex = 0; groupIndex < numberOfGroups; groupIndex++) {
    const size = baseSize + (groupIndex < remainder ? 1 : 0);

    groups.push(shuffled.slice(index, index + size));
    index += size;
  }

  groups.forEach((group, groupIndex) => {
    let gameNumber = 1;

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        matches.push({
          competitionId,
          homeTeamId: group[i].id,
          awayTeamId: group[j].id,
          group: getGroupLabel(groupIndex + 1),
          round: `Jogo ${gameNumber++}`,
          date: new Date(),
        });
      }
    }
  });

  return matches;
}

export function createLeagueMatches(
  competitionId: number,
  teams: Team[],
  opponents: number,
) {
  const matches: Prisma.MatchCreateManyInput[] = [];

  const degree = new Map<number, number>();
  const played = new Set<string>();

  for (const team of teams) {
    degree.set(team.id, 0);
  }

  function key(a: number, b: number) {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
  }

  function backtrack(): boolean {
    const team = teams.find((t) => degree.get(t.id)! < opponents);

    if (!team) {
      return true;
    }

    for (const opponent of teams) {
      if (team.id === opponent.id) continue;

      if (degree.get(opponent.id)! >= opponents) continue;

      const pair = key(team.id, opponent.id);

      if (played.has(pair)) continue;

      played.add(pair);
      degree.set(team.id, degree.get(team.id)! + 1);
      degree.set(opponent.id, degree.get(opponent.id)! + 1);

      matches.push({
        competitionId,
        homeTeamId: team.id,
        awayTeamId: opponent.id,
        round: `Jogo ${matches.length + 1}`,
        date: new Date(),
      });

      if (backtrack()) {
        return true;
      }

      matches.pop();
      played.delete(pair);
      degree.set(team.id, degree.get(team.id)! - 1);
      degree.set(opponent.id, degree.get(opponent.id)! - 1);
    }

    return false;
  }

  if (!backtrack()) {
    throw new Error("Unable to generate league matches.");
  }

  return matches;
}

export function calculateLeagueStandings(
  teams: TeamBEResponse[],
  matches: MatchBEResponse[],
): LeagueStanding[] {
  const standings = new Map<number, LeagueStanding>();

  for (const team of teams) {
    standings.set(team.id, {
      position: 0,
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (!match.homeTeamId || !match.awayTeamId) continue;
    if (match.status !== MatchStatus.RT_END) continue;

    const home = standings.get(match.homeTeamId);
    const away = standings.get(match.awayTeamId);

    if (!home || !away) continue;

    const { homeGoals, awayGoals } = getMatchScore(match);

    home.played++;
    away.played++;

    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;

    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.won++;
      home.points += 3;

      away.lost++;
    } else if (awayGoals > homeGoals) {
      away.won++;
      away.points += 3;

      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;

      home.points++;
      away.points++;
    }
  }

  const table = [...standings.values()]
    .map((team) => ({
      ...team,
      goalDifference: team.goalsFor - team.goalsAgainst,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }

      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }

      return a.team.name.localeCompare(b.team.name);
    })
    .map((team, index) => ({
      ...team,
      position: index + 1,
    }));

  return table;
}

export function calculateGroupStandings(matches: MatchBEResponse[]) {
  const teamsByGroup = new Map<string, Map<number, TeamBEResponse>>();
  const matchesByGroup = new Map<string, MatchBEResponse[]>();

  for (const match of matches) {
    if (!match.group) continue;

    if (!teamsByGroup.has(match.group)) {
      teamsByGroup.set(match.group, new Map());
      matchesByGroup.set(match.group, []);
    }

    if (match.homeTeam) {
      teamsByGroup.get(match.group)!.set(match.homeTeam.id, match.homeTeam);
    }

    if (match.awayTeam) {
      teamsByGroup.get(match.group)!.set(match.awayTeam.id, match.awayTeam);
    }

    matchesByGroup.get(match.group)!.push(match);
  }

  return [...teamsByGroup.entries()]
    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
    .map(([group, teams]) => ({
      group,
      standings: calculateLeagueStandings(
        [...teams.values()],
        matchesByGroup.get(group) ?? [],
      ),
      matches: matchesByGroup.get(group) ?? [],
    }));
}

export function getStages(qualified: number): string[] {
  return stagesByQualified[qualified] ?? [];
}

export function isKnockoutRound(round: string) {
  return knockoutRounds.has(round);
}

export function createKnockoutMatches(
  competitionId: number,
  qualified: number,
): Prisma.MatchCreateManyInput[] {
  const stages = getStages(qualified);
  const matches: Prisma.MatchCreateManyInput[] = [];

  let matchesInRound = qualified / 2;

  for (const stage of stages) {
    for (let index = 0; index < matchesInRound; index++) {
      matches.push({
        competitionId,
        round: stage,
        date: new Date(),
      });
    }

    matchesInRound = Math.max(matchesInRound / 2, 1);
  }

  return matches;
}

function isPowerOfTwo(value: number) {
  return value > 1 && (value & (value - 1)) === 0;
}

function compareStandings(a: LeagueStanding, b: LeagueStanding) {
  if (a.position !== b.position) {
    return a.position - b.position;
  }

  if (b.points !== a.points) {
    return b.points - a.points;
  }

  if (b.goalDifference !== a.goalDifference) {
    return b.goalDifference - a.goalDifference;
  }

  if (b.goalsFor !== a.goalsFor) {
    return b.goalsFor - a.goalsFor;
  }

  return a.team.name.localeCompare(b.team.name);
}

export function getQualifiedSeeds({
  config,
  qualified,
  teams,
  matches,
}: {
  config: CompetitionConfig;
  qualified: number;
  teams: TeamBEResponse[];
  matches: MatchBEResponse[];
}): KnockoutSeed[] {
  if (!isPowerOfTwo(qualified)) {
    return [];
  }

  if (config === CompetitionConfig.LEAGUE) {
    return calculateLeagueStandings(teams, matches)
      .slice(0, qualified)
      .map((standing, index) => ({
        seed: index + 1,
        standing,
      }));
  }

  return calculateGroupStandings(matches)
    .flatMap(({ group, standings }) =>
      standings.map((standing) => ({
        group,
        standing,
      })),
    )
    .sort((a, b) => compareStandings(a.standing, b.standing))
    .slice(0, qualified)
    .map((seed, index) => ({
      ...seed,
      seed: index + 1,
    }));
}

export function createLeagueQualificationSources(qualified: number) {
  return Array.from(
    { length: qualified },
    (_, index) => `${index + 1}.º classificado`,
  );
}

export function getMatchScore(match: MatchBEResponse) {
  let homeGoals = 0;
  let awayGoals = 0;

  if (!match.homeTeamId || !match.awayTeamId) {
    return { homeGoals, awayGoals };
  }

  for (const event of match.events ?? []) {
    switch (event.type) {
      case MatchEventType.GOAL:
      case MatchEventType.PENALTY_GOAL:
        if (event.teamId === match.homeTeamId) homeGoals++;
        if (event.teamId === match.awayTeamId) awayGoals++;
        break;

      case MatchEventType.OWN_GOAL:
        if (event.teamId === match.homeTeamId) awayGoals++;
        if (event.teamId === match.awayTeamId) homeGoals++;
        break;
    }
  }

  return { homeGoals, awayGoals };
}

export function groupMatchesByStage(
  matches: MatchBEResponse[],
  stages: string[],
) {
  const matchesByStage = new Map<string, MatchBEResponse[]>();

  for (const match of matches) {
    const list = matchesByStage.get(match.round) ?? [];
    list.push(match);
    matchesByStage.set(match.round, list);
  }

  return stages
    .map((stage) => ({
      stage,
      matches: matchesByStage.get(stage) ?? [],
    }))
    .filter((stage) => stage.matches.length);
}

export function getCompetitionShuffleView(
  competition: CompetitionForShuffle,
  matches: MatchBEResponse[],
) {
  const initialMatches: MatchBEResponse[] = [];
  const knockoutMatches: MatchBEResponse[] = [];
  const leagueMatches: MatchBEResponse[] = [];

  for (const match of matches) {
    if (isKnockoutRound(match.round)) {
      knockoutMatches.push(match);
    } else {
      initialMatches.push(match);

      if (!match.group) {
        leagueMatches.push(match);
      }
    }
  }

  const standings = calculateLeagueStandings(competition.teams, leagueMatches);
  const groups = calculateGroupStandings(initialMatches).map((group) => ({
    ...group,
    groups: calculateGroupStandings(initialMatches),
  }));
  const qualified = competition.qualified ?? 0;
  const seeds = getQualifiedSeeds({
    config: competition.config,
    qualified,
    teams: competition.teams,
    matches:
      competition.config === CompetitionConfig.GROUP
        ? initialMatches
        : leagueMatches,
  });
  const stages = getStages(qualified);

  return {
    isGroupCompetition: competition.config === CompetitionConfig.GROUP,
    standings,
    groups,
    leagueMatches,
    knockoutRounds: groupMatchesByStage(knockoutMatches, stages),
    qualifiedTeamIds: new Set(seeds.map((seed) => seed.standing.team.id)),
  };
}

export function createKnockoutPlaceholders(
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
        if (stageIndex === 0) {
          return {
            home: qualificationSources[index] ?? "-",
            away:
              qualificationSources[qualificationSources.length - 1 - index] ??
              "-",
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

type MatchForPlaceholders = {
  round: string;
  group?: string | null;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
};

function createGroupQualificationSourcesFromMatches(
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

  return sources.slice(0, qualified);
}

export function addKnockoutPlaceholders<T extends MatchForPlaceholders>({
  config,
  qualified,
  matches,
}: {
  config: CompetitionConfig;
  qualified: number;
  matches: T[];
}) {
  const stages = getStages(qualified);
  const initialMatches = matches.filter(
    (match) => !isKnockoutRound(match.round),
  );
  const qualificationSources =
    config === CompetitionConfig.GROUP
      ? createGroupQualificationSourcesFromMatches(initialMatches, qualified)
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

function getGroupLabel(index: number) {
  return String.fromCharCode(64 + index);
}
