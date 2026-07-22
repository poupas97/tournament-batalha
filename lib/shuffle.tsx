import { Match, Prisma, Team } from "@/generated/prisma";

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
          round: `Grupo ${groupIndex + 1} - Jogo ${gameNumber++}`,
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
