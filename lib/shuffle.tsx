import {
  CompetitionConfig,
  MatchEventType,
  MatchStatus,
  Prisma,
  Team,
} from "@/generated/prisma";
import {
  CompetitionForShuffle,
  KnockoutSeed,
  LeagueStanding,
} from "@/types/competition";
import {
  MatchBEResponse,
  MatchForPlaceholders,
  RoundMatch,
} from "@/types/match";
import { TeamBEResponse } from "@/types/team";

const stagesByQualified: Record<number, string[]> = {
  2: ["Final"],
  4: ["1/2 final", "Final"],
  8: ["1/4 final", "1/2 final", "Final"],
  16: ["1/8 final", "1/4 final", "1/2 final", "Final"],
  32: ["1/16 final", "1/8 final", "1/4 final", "1/2 final", "Final"],
};

const bracketSeeds: Record<number, number[]> = {
  2: [1, 2],
  4: [1, 4, 2, 3],
  8: [1, 8, 4, 5, 2, 7, 3, 6],
  16: [1, 16, 8, 9, 5, 12, 4, 13, 3, 14, 6, 11, 7, 10, 2, 15],
  32: [
    1, 32, 16, 17, 8, 25, 9, 24, 5, 28, 12, 21, 13, 20, 4, 29, 3, 30, 14, 19,
    11, 22, 6, 27, 7, 26, 10, 23, 15, 18, 2, 31,
  ],
};

const knockoutRounds = new Set(Object.values(stagesByQualified).flat());

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
  const groups = createGroups(teams, teamsPerGroup);
  const roundsPerGroup = groups.map((group) => createLeagueRounds(group));
  const matches: Prisma.MatchCreateManyInput[] = [];
  const maxRounds = Math.max(...roundsPerGroup.map((rounds) => rounds.length));

  for (let roundIndex = 0; roundIndex < maxRounds; roundIndex++) {
    for (let groupIndex = 0; groupIndex < roundsPerGroup.length; groupIndex++) {
      const round = roundsPerGroup[groupIndex][roundIndex];

      if (!round) continue;

      round.forEach(({ home, away }) => {
        matches.push({
          competitionId,
          homeTeamId: home.id,
          awayTeamId: away.id,
          group: getGroupLabel(groupIndex + 1),
          round: `Jornada ${roundIndex + 1}`,
          date: getMatchDate(matches.length),
        });
      });
    }
  }

  return matches;
}

function createGroups(teams: Team[], teamsPerGroup: number): Team[][] {
  const shuffled = shuffle(teams);
  const totalGroups = Math.ceil(shuffled.length / teamsPerGroup);
  const baseSize = Math.floor(shuffled.length / totalGroups);
  const groups: Team[][] = [];

  let remainder = shuffled.length % totalGroups;
  let index = 0;

  for (let i = 0; i < totalGroups; i++) {
    const size = baseSize + (remainder-- > 0 ? 1 : 0);
    groups.push(shuffled.slice(index, index + size));

    index += size;
  }

  return groups;
}

export function createLeagueMatches(
  competitionId: number,
  teams: Team[],
  opponents: number,
): Prisma.MatchCreateManyInput[] {
  const rounds = createLeagueRounds(teams);
  const matches: Prisma.MatchCreateManyInput[] = [];

  rounds.slice(0, opponents).forEach((round, roundIndex) => {
    round.forEach(({ home, away }) => {
      matches.push({
        competitionId,
        homeTeamId: home.id,
        awayTeamId: away.id,
        round: `Jornada ${roundIndex + 1}`,
        date: getMatchDate(matches.length),
      });
    });
  });

  return matches;
}

function calculateLeagueStandings(
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

function calculateGroupStandings(matches: MatchBEResponse[]) {
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

function getStages(qualified: number): string[] {
  return stagesByQualified[qualified] ?? [];
}

function isKnockoutRound(round: string) {
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
        date: getMatchDate(matches.length),
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

function getQualifiedSeeds({
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

function createLeagueQualificationSources(qualified: number) {
  return (bracketSeeds[qualified] ?? []).map((seed) => `${seed}.º class`);
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

function groupMatchesByStage(matches: MatchBEResponse[], stages: string[]) {
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
          home: `Venc ${previousStage} ${previousMatch}`,
          away: `Venc ${previousStage} ${previousMatch + 1}`,
        };
      }),
    );
  }

  return placeholders;
}

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

  const order = bracketSeeds[qualified] ?? [];

  return order.map((seed) => sources[seed - 1]);
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

function getMatchDate(index: number, intervalMinutes = 60, startDate?: Date) {
  const start = startDate ? new Date(startDate) : new Date();

  // by default, start from the next day at 9:00 AM
  if (!startDate) {
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0);
  }

  start.setMinutes(start.getMinutes() + index * intervalMinutes);

  return start;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function createLeagueRounds(teams: Team[]): RoundMatch[][] {
  const list = [...teams];

  if (list.length % 2 !== 0) {
    list.push(null as never);
  }

  const rounds: RoundMatch[][] = [];
  const totalRounds = list.length - 1;
  const half = list.length / 2;

  for (let round = 0; round < totalRounds; round++) {
    const matches: RoundMatch[] = [];

    for (let i = 0; i < half; i++) {
      const home = list[i];
      const away = list[list.length - 1 - i];

      if (!home || !away) continue;

      matches.push(
        round % 2 === 0 ? { home, away } : { home: away, away: home },
      );
    }

    rounds.push(matches);

    const fixed = list[0];
    const rotating = list.slice(1);

    rotating.unshift(rotating.pop()!);
    list.splice(0, list.length, fixed, ...rotating);
  }

  return rounds;
}
