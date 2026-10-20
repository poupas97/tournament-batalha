import { PrismaClient } from "@/generated/prisma";

export const rankingScoresQuery = async (
  prisma: PrismaClient,
  competitionId: number,
) =>
  await prisma.$queryRaw`
    SELECT
        p.id AS "playerId",
        p.name AS "playerName",
        p.photo AS "playerPhoto",
        t.name AS "teamName",
        COUNT(*)::int AS goals,
        COUNT(DISTINCT me."matchId")::int AS matches,
        RANK() OVER (
            ORDER BY
                COUNT(*) DESC,
                COUNT(DISTINCT me."matchId") ASC
        )::int AS position
    FROM "MatchEvent" me
    JOIN "Player" p ON p.id = me."playerId"
    JOIN "Team" t ON t.id = p."teamId"
    JOIN "Match" m ON m.id = me."matchId"
    WHERE
        me.type IN ('GOAL', 'PENALTY_GOAL')
        AND m."competitionId" = ${competitionId}
        AND m.status IN ('RT_END', 'ET_END', 'PENALTIES_END')
    GROUP BY
        p.id,
        p.name,
        p.photo,
        t.name
    ORDER BY
        goals DESC,
        matches ASC,
        p.name ASC;
  `;
