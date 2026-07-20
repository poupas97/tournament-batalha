import prisma from "@/lib/prisma";
import { getParamId, getResponse, invalidParam } from "@/lib/api";
import { RouteContext } from "@/types/api";

export async function GET(request: Request, context: RouteContext) {
  const competitionId = await getParamId(context);

  if (!competitionId) {
    return invalidParam("Competition");
  }

  const rankingScores = await prisma.$queryRaw`
    SELECT
        p.id AS "playerId",
        p.name AS "playerName",
        t.name AS "teamName",
        COUNT(*)::int AS goals,
        COUNT(DISTINCT me."matchId")::int AS matches,
        ROW_NUMBER() OVER (
            ORDER BY
                COUNT(*) DESC,
                COUNT(DISTINCT me."matchId") ASC,
                p.name ASC
        )::int AS position
    FROM "MatchEvent" me
    JOIN "Player" p ON p.id = me."playerId"
    JOIN "Team" t ON t.id = p."teamId"
    JOIN "Match" m ON m.id = me."matchId"
    WHERE
        me.type IN ('GOAL', 'PENALTY_GOAL')
        AND m."competitionId" = ${competitionId}
    GROUP BY
        p.id,
        p.name,
        t.name
    ORDER BY
        goals DESC,
        matches ASC,
        p.name;
  `;

  const rankingTeams = await prisma.$queryRaw`
    WITH match_scores AS (
        SELECT
            m.id,
            m."homeTeamId",
            m."awayTeamId",

            SUM(
                CASE
                    WHEN me.type IN ('GOAL', 'PENALTY_GOAL')
                        AND me."teamId" = m."homeTeamId" THEN 1
                    WHEN me.type = 'OWN_GOAL'
                        AND me."teamId" = m."awayTeamId" THEN 1
                    ELSE 0
                END
            )::int AS home_goals,

            SUM(
                CASE
                    WHEN me.type IN ('GOAL', 'PENALTY_GOAL')
                        AND me."teamId" = m."awayTeamId" THEN 1
                    WHEN me.type = 'OWN_GOAL'
                        AND me."teamId" = m."homeTeamId" THEN 1
                    ELSE 0
                END
            )::int AS away_goals

        FROM "Match" m

        LEFT JOIN "MatchEvent" me
            ON me."matchId" = m.id

        WHERE
            m."competitionId" = ${competitionId}
            AND m.status = 'RT_END'

        GROUP BY
            m.id,
            m."homeTeamId",
            m."awayTeamId"
    ),

    team_matches AS (
        SELECT
            "homeTeamId" AS team_id,
            home_goals AS goals_for,
            away_goals AS goals_against
        FROM match_scores

        UNION ALL

        SELECT
            "awayTeamId" AS team_id,
            away_goals AS goals_for,
            home_goals AS goals_against
        FROM match_scores
    ),

    ranking AS (
        SELECT
            t.id,
            t.name AS team_name,

            COUNT(*)::int AS matches,

            SUM(
                CASE
                    WHEN goals_for > goals_against THEN 1
                    ELSE 0
                END
            )::int AS wins,

            SUM(
                CASE
                    WHEN goals_for = goals_against THEN 1
                    ELSE 0
                END
            )::int AS draws,

            SUM(
                CASE
                    WHEN goals_for < goals_against THEN 1
                    ELSE 0
                END
            )::int AS losses,

            SUM(
                CASE
                    WHEN goals_for > goals_against THEN 3
                    WHEN goals_for = goals_against THEN 1
                    ELSE 0
                END
            )::int AS points,

            SUM(goals_for)::int AS goals_for,

            SUM(goals_against)::int AS goals_against,

            (SUM(goals_for) - SUM(goals_against))::int AS goal_difference

        FROM team_matches tm

        JOIN "Team" t
            ON t.id = tm.team_id

        GROUP BY
            t.id,
            t.name
    )

    SELECT
        ROW_NUMBER() OVER (
            ORDER BY
                points DESC,
                goal_difference DESC,
                goals_for DESC,
                team_name ASC
        )::int AS position,

        id AS "teamId",
        team_name AS "teamName",
        matches,
        wins,
        draws,
        losses,
        points,
        goals_for AS "goalsFor",
        goals_against AS "goalsAgainst",
        goal_difference AS "goalDifference"

    FROM ranking

    ORDER BY
        points DESC,
        goal_difference DESC,
        goals_for DESC,
        team_name ASC;
    `;

  return getResponse({ rankingScores, rankingTeams });
}
