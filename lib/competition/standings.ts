import { CompetitionConfig } from "@/generated/prisma";
import { LEAGUE_POINTS } from "@/constants/competition";
import {
  getCompetitionStages,
  isKnockoutRound,
} from "@/lib/competition/rounds";
import {
  CompetitionForShuffle,
  KnockoutSeed,
  LeagueStanding,
} from "@/types/competition";
import { MatchBEResponse } from "@/types/match";
import { TeamBEResponse } from "@/types/team";
import { getMatchScore, isMatchFinished } from "../match";

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
    if (!isMatchFinished(match.status)) continue;

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
      home.points += LEAGUE_POINTS.win;
      away.lost++;
    } else if (awayGoals > homeGoals) {
      away.won++;
      away.points += LEAGUE_POINTS.win;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += LEAGUE_POINTS.draw;
      away.points += LEAGUE_POINTS.draw;
    }
  }

  return [...standings.values()]
    .map((standing) => ({
      ...standing,
      goalDifference: standing.goalsFor - standing.goalsAgainst,
    }))
    .sort(compareStandingCriteria)
    .map((standing, index) => ({ ...standing, position: index + 1 }));
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

export function getRegularMatches<T extends { round: string }>(matches: T[]) {
  return matches.filter((match) => !isKnockoutRound(match.round));
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
  if (qualified <= 1 || (qualified & (qualified - 1)) !== 0) {
    return [];
  }

  if (config === CompetitionConfig.LEAGUE) {
    return calculateLeagueStandings(teams, matches)
      .slice(0, qualified)
      .map((standing, index) => ({ seed: index + 1, standing }));
  }

  return calculateGroupStandings(matches)
    .flatMap(({ group, standings }) =>
      standings.map((standing) => ({ group, standing })),
    )
    .sort((a, b) => {
      if (a.standing.position !== b.standing.position) {
        return a.standing.position - b.standing.position;
      }

      return compareStandingCriteria(a.standing, b.standing);
    })
    .slice(0, qualified)
    .map((seed, index) => ({ ...seed, seed: index + 1 }));
}

export function getCompetitionShuffleView(
  competition: CompetitionForShuffle,
  matches: MatchBEResponse[],
) {
  const regularMatches = getRegularMatches(matches);
  const knockoutMatches = matches.filter((match) =>
    isKnockoutRound(match.round),
  );
  const leagueMatches = regularMatches.filter((match) => !match.group);
  const standings = calculateLeagueStandings(competition.teams, leagueMatches);
  const groups = calculateGroupStandings(regularMatches);
  const qualified = competition.qualified ?? 0;
  const seeds = getQualifiedSeeds({
    config: competition.config,
    qualified,
    teams: competition.teams,
    matches:
      competition.config === CompetitionConfig.GROUP
        ? regularMatches
        : leagueMatches,
  });
  const stages = getCompetitionStages(qualified);

  return {
    isGroupCompetition: competition.config === CompetitionConfig.GROUP,
    standings,
    groups,
    leagueMatches,
    knockoutRounds: groupMatchesByStage(knockoutMatches, stages),
    qualifiedTeamIds: new Set(seeds.map((seed) => seed.standing.team.id)),
  };
}

function compareStandingCriteria(a: LeagueStanding, b: LeagueStanding) {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) {
    return b.goalDifference - a.goalDifference;
  }
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

  return a.team.name.localeCompare(b.team.name);
}

function groupMatchesByStage(matches: MatchBEResponse[], stages: string[]) {
  const matchesByStage = new Map<string, MatchBEResponse[]>();

  for (const match of matches) {
    const stageMatches = matchesByStage.get(match.round) ?? [];
    stageMatches.push(match);
    matchesByStage.set(match.round, stageMatches);
  }

  return stages
    .map((stage) => matchesByStage.get(stage) ?? [])
    .filter((stageMatches) => stageMatches.length > 0);
}
