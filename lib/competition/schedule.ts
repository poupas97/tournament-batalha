import { Prisma, Team } from "@/generated/prisma";
import {
  COMPETITION_SCHEDULE,
  REGULAR_ROUND_LABEL_PREFIX,
} from "@/constants/competition";
import { getCompetitionStages } from "@/lib/competition/rounds";
import { RoundMatch } from "@/types/match";

export function canCreateLeague(numberOfTeams: number, opponents: number) {
  return (
    numberOfTeams >= 2 &&
    opponents >= 1 &&
    opponents < numberOfTeams &&
    (numberOfTeams * opponents) % 2 === 0
  );
}

export function canCreateGroups(numberOfTeams: number, teamsPerGroup: number) {
  if (numberOfTeams < 2 || teamsPerGroup < 2 || teamsPerGroup > numberOfTeams) {
    return false;
  }

  const numberOfGroups = Math.ceil(numberOfTeams / teamsPerGroup);

  return Math.floor(numberOfTeams / numberOfGroups) >= 2;
}

export function createGroupMatches(
  competitionId: number,
  teams: Team[],
  teamsPerGroup: number,
  startDate: Date,
): Prisma.MatchCreateManyInput[] {
  const groups = createGroups(teams, teamsPerGroup);
  const roundsPerGroup = groups.map((group) => createLeagueRounds(group));
  const matches: Prisma.MatchCreateManyInput[] = [];
  const scheduleStart = getScheduleStart(startDate);
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
          group: String.fromCharCode(64 + groupIndex + 1),
          round: `${REGULAR_ROUND_LABEL_PREFIX} ${roundIndex + 1}`,
          date: getMatchDate(matches.length, scheduleStart),
        });
      });
    }
  }

  return matches;
}

export function createLeagueMatches(
  competitionId: number,
  teams: Team[],
  opponents: number,
  startDate: Date,
): Prisma.MatchCreateManyInput[] {
  const shuffledTeams = getSeededTeamOrder(teams);
  const rounds =
    shuffledTeams.length % 2 === 0
      ? createLeagueRounds(shuffledTeams).slice(0, opponents)
      : createOddTeamLeagueRounds(shuffledTeams, opponents);
  const matches: Prisma.MatchCreateManyInput[] = [];
  const scheduleStart = getScheduleStart(startDate);

  rounds.forEach((round, roundIndex) => {
    round.forEach(({ home, away }) => {
      matches.push({
        competitionId,
        homeTeamId: home.id,
        awayTeamId: away.id,
        round: `${REGULAR_ROUND_LABEL_PREFIX} ${roundIndex + 1}`,
        date: getMatchDate(matches.length, scheduleStart),
      });
    });
  });

  return matches;
}

export function createKnockoutMatches(
  competitionId: number,
  qualified: number,
  regularMatches: { date: Date | string }[] = [],
  startDate: Date = new Date(),
): Prisma.MatchCreateManyInput[] {
  const stages = getCompetitionStages(qualified);
  const matches: Prisma.MatchCreateManyInput[] = [];
  const lastRegularMatchDate = regularMatches.reduce<Date | undefined>(
    (latest, match) => {
      const matchDate = new Date(match.date);
      return !latest || matchDate > latest ? matchDate : latest;
    },
    undefined,
  );
  let roundStart = lastRegularMatchDate
    ? getScheduleStartAfterInterval(lastRegularMatchDate)
    : getScheduleStart(startDate);

  let matchesInRound = qualified / 2;

  for (const stage of stages) {
    for (let index = 0; index < matchesInRound; index++) {
      matches.push({
        competitionId,
        round: stage,
        date: getMatchDate(index, roundStart),
      });
    }

    if (matchesInRound > 0) {
      const lastMatchInRound = getMatchDate(matchesInRound - 1, roundStart);
      roundStart = getScheduleStartAfterInterval(lastMatchInRound);
    }

    matchesInRound = Math.max(matchesInRound / 2, 1);
  }

  return matches;
}

function createGroups(teams: Team[], teamsPerGroup: number): Team[][] {
  const totalGroups = Math.ceil(teams.length / teamsPerGroup);
  const baseSize = Math.floor(teams.length / totalGroups);
  const remainder = teams.length % totalGroups;
  const groups = Array.from({ length: totalGroups }, () => [] as Team[]);
  const capacities = groups.map(
    (_, index) => baseSize + (index < remainder ? 1 : 0),
  );
  const pots = new Map<number, Team[]>();

  for (const team of teams) {
    const pot = pots.get(team.pot) ?? [];
    pot.push(team);
    pots.set(team.pot, pot);
  }

  const sortedPots = [...pots.entries()].sort(([potA], [potB]) => potA - potB);
  let direction = 1;
  let startGroup = 0;

  for (const [, potTeams] of sortedPots) {
    const shuffledPot = shuffleTeams(potTeams);
    let groupIndex = startGroup;

    for (const team of shuffledPot) {
      let checked = 0;
      while (
        groups[groupIndex].length >= capacities[groupIndex] &&
        checked < totalGroups
      ) {
        groupIndex = (groupIndex + direction + totalGroups) % totalGroups;
        checked++;
      }
      groups[groupIndex].push(team);
      groupIndex = (groupIndex + direction + totalGroups) % totalGroups;
    }

    startGroup = (groupIndex + totalGroups) % totalGroups;
    direction *= -1;
  }

  return groups;
}

function getSeededTeamOrder(teams: Team[]) {
  const pots = new Map<number, Team[]>();

  for (const team of teams) {
    const pot = pots.get(team.pot) ?? [];
    pot.push(team);
    pots.set(team.pot, pot);
  }

  const shuffledPots = [...pots.entries()]
    .sort(([potA], [potB]) => potA - potB)
    .map(([, pot]) => shuffleTeams(pot));
  const ordered: Team[] = [];
  const maxPotSize = Math.max(...shuffledPots.map((pot) => pot.length));

  for (let index = 0; index < maxPotSize; index++) {
    for (const pot of shuffledPots) {
      if (pot[index]) ordered.push(pot[index]);
    }
  }

  return ordered;
}

function getScheduleStart(startDate: Date) {
  return new Date(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
    COMPETITION_SCHEDULE.firstMatchHour,
  );
}

function getScheduleStartAfterInterval(date: Date) {
  const start = new Date(date);
  start.setDate(
    start.getDate() + COMPETITION_SCHEDULE.restDaysBetweenKnockoutRounds + 1,
  );
  start.setHours(COMPETITION_SCHEDULE.firstMatchHour, 0, 0, 0);

  return start;
}

function getMatchDate(index: number, scheduleStart: Date) {
  const start = new Date(scheduleStart);
  let matchDaysToAdd = Math.floor(index / COMPETITION_SCHEDULE.matchesPerDay);
  const positionInDay = index % COMPETITION_SCHEDULE.matchesPerDay;

  while (start.getDay() === 0) {
    start.setDate(start.getDate() + 1);
  }

  while (matchDaysToAdd > 0) {
    start.setDate(start.getDate() + 1);

    if (start.getDay() !== 0) {
      matchDaysToAdd--;
    }
  }

  start.setMinutes(
    start.getMinutes() +
      positionInDay * COMPETITION_SCHEDULE.matchIntervalMinutes,
  );

  return start;
}

function shuffleTeams(teams: Team[]) {
  const shuffled = [...teams];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function createOddTeamLeagueRounds(teams: Team[], opponents: number) {
  const rounds: RoundMatch[][] = [];
  const occupiedTeamsByRound: Set<number>[] = [];

  // For an odd number of teams, a valid league has an even number of opponents.
  // Pair each team with its neighbors in a randomized circular order so every
  // team gets exactly `opponents` distinct opponents.
  for (let offset = 1; offset <= opponents / 2; offset++) {
    for (let index = 0; index < teams.length; index++) {
      const home = teams[index];
      const away = teams[(index + offset) % teams.length];
      let roundIndex = 0;

      while (
        occupiedTeamsByRound[roundIndex]?.has(home.id) ||
        occupiedTeamsByRound[roundIndex]?.has(away.id)
      ) {
        roundIndex++;
      }

      if (!rounds[roundIndex]) {
        rounds[roundIndex] = [];
        occupiedTeamsByRound[roundIndex] = new Set();
      }

      rounds[roundIndex].push({ home, away });
      occupiedTeamsByRound[roundIndex].add(home.id);
      occupiedTeamsByRound[roundIndex].add(away.id);
    }
  }

  return rounds;
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
