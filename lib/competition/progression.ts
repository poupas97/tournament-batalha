import { CompetitionStatus, Prisma } from "@/generated/prisma";
import { KNOCKOUT_BRACKET_SEEDS } from "@/constants/competition";
import {
  canCreateKnockout,
  getCompetitionStages,
  isKnockoutRound,
} from "@/lib/competition/rounds";
import {
  getQualifiedSeeds,
  getRegularMatches,
} from "@/lib/competition/standings";
import { CompetitionBEResponse } from "@/types/competition";
import { MatchBEResponse } from "@/types/match";
import { getMatchScore, isMatchFinished } from "../match";

export async function resolveCompetitionProgression(
  competitionId: number,
  tx: Prisma.TransactionClient,
) {
  const competition = await tx.competition.findUnique({
    where: { id: competitionId, deletedAt: null },
    include: {
      teams: { where: { deletedAt: null } },
      matches: {
        where: { deletedAt: null },
        include: { events: true, homeTeam: true, awayTeam: true },
        orderBy: { id: "asc" },
      },
    },
  });

  if (
    !competition ||
    competition.status === CompetitionStatus.FINISHED ||
    !competition.qualified
  ) {
    return;
  }

  const matches = competition.matches;
  const knockoutMatches = matches.filter((match) =>
    isKnockoutRound(match.round),
  );

  if (!knockoutMatches.some(hasAssignedTeams)) {
    await resolveRegularPhase(
      competition as unknown as CompetitionBEResponse,
      tx,
    );
    return;
  }

  await resolveKnockoutProgression(
    competition as unknown as CompetitionBEResponse,
    tx,
  );
}

async function resolveRegularPhase(
  competition: CompetitionBEResponse,
  tx: Prisma.TransactionClient,
) {
  const matches = competition.matches ?? [];
  const regularMatches = getRegularMatches(matches);
  const qualified = competition.qualified;

  if (
    !regularMatches.length ||
    !regularMatches.every((match) => isMatchFinished(match.status)) ||
    !qualified
  ) {
    return;
  }

  if (!canCreateKnockout(qualified)) {
    await tx.competition.update({
      where: { id: competition.id },
      data: { status: CompetitionStatus.FINISHED },
    });
    return;
  }

  await populateFirstKnockoutRound(competition, tx);
}

async function resolveKnockoutProgression(
  competition: CompetitionBEResponse,
  tx: Prisma.TransactionClient,
) {
  const qualified = competition.qualified;
  const matches = competition.matches ?? [];
  const stages = qualified ? getCompetitionStages(qualified) : [];

  if (!qualified || !stages.length || !matches.length) return;

  for (let index = 0; index < stages.length; index++) {
    const currentMatches = getMatchesByRound(matches, stages[index]);

    if (!currentMatches.length) return;

    const roundReady = currentMatches.every(hasBothTeams);

    if (!roundReady || !isKnockoutRoundFinished(currentMatches)) return;

    if (index === stages.length - 1) {
      await tx.competition.update({
        where: { id: competition.id },
        data: { status: CompetitionStatus.FINISHED },
      });
      return;
    }

    const nextMatches = getMatchesByRound(matches, stages[index + 1]);

    await populateNextKnockoutRound(currentMatches, nextMatches, tx);
    return;
  }
}

async function populateFirstKnockoutRound(
  competition: CompetitionBEResponse,
  tx: Prisma.TransactionClient,
) {
  const qualified = competition.qualified;
  const stages = qualified ? getCompetitionStages(qualified) : [];
  const matches = competition.matches ?? [];
  const firstRound = stages[0];

  if (!qualified || !firstRound || !canCreateKnockout(qualified)) return;

  const knockoutMatches = getMatchesByRound(matches, firstRound);

  if (!knockoutMatches.length || knockoutMatches.some(hasAssignedTeams)) return;

  const seeds = getQualifiedSeeds({
    config: competition.config,
    qualified,
    teams: competition.teams,
    matches: getRegularMatches(matches),
  });

  if (seeds.length !== qualified) return;

  const seedsByPosition = new Map(
    seeds.map((seed) => [seed.seed, seed.standing.team.id]),
  );
  const bracketOrder = KNOCKOUT_BRACKET_SEEDS[qualified] ?? [];

  if (bracketOrder.length !== qualified) return;

  const teamIds = bracketOrder.map((seed) => seedsByPosition.get(seed));

  if (!teamIds.every(isDefined)) return;

  await assignTeamsToMatches(knockoutMatches, teamIds, tx);
}

async function populateNextKnockoutRound(
  currentRoundMatches: MatchBEResponse[],
  nextRoundMatches: MatchBEResponse[],
  tx: Prisma.TransactionClient,
) {
  if (!nextRoundMatches.length || nextRoundMatches.some(hasAssignedTeams))
    return;

  const winners = currentRoundMatches.map(getKnockoutWinner);

  if (!winners.every(isDefined)) return;

  await assignTeamsToMatches(nextRoundMatches, winners, tx);
}

async function assignTeamsToMatches(
  matches: MatchBEResponse[],
  teamIds: number[],
  tx: Prisma.TransactionClient,
) {
  if (teamIds.length !== matches.length * 2) return false;

  for (let index = 0; index < matches.length; index++) {
    await tx.match.update({
      where: { id: matches[index].id },
      data: {
        homeTeamId: teamIds[index * 2],
        awayTeamId: teamIds[index * 2 + 1],
      },
    });
  }

  return true;
}

function getKnockoutWinner(match: MatchBEResponse) {
  if (!hasBothTeams(match)) return null;

  const { homeGoals, awayGoals } = getMatchScore(match);

  if (homeGoals === awayGoals) return null;

  return homeGoals > awayGoals ? match.homeTeamId : match.awayTeamId;
}

function getMatchesByRound(matches: MatchBEResponse[], round: string) {
  return matches
    .filter((match) => match.round === round)
    .sort((a, b) => a.id - b.id);
}

function isKnockoutRoundFinished(matches: MatchBEResponse[]) {
  return (
    matches.length > 0 &&
    matches.every(
      (match) =>
        isMatchFinished(match.status) && getKnockoutWinner(match) !== null,
    )
  );
}

function hasAssignedTeams(match: {
  homeTeamId?: number | null;
  awayTeamId?: number | null;
}) {
  return match.homeTeamId != null || match.awayTeamId != null;
}

function hasBothTeams(match: MatchBEResponse) {
  return match.homeTeamId != null && match.awayTeamId != null;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value != null;
}
