ALTER TABLE "Match" ALTER COLUMN "status" DROP DEFAULT;

ALTER TYPE "MatchStatus" RENAME TO "MatchStatus_old";

CREATE TYPE "MatchStatus" AS ENUM (
  'SCHEDULED',
  'RT_START',
  'RT_HALF_TIME',
  'RT_RESTART',
  'RT_END',
  'ET_START',
  'ET_HALF_TIME',
  'ET_RESTART',
  'ET_END',
  'PENALTIES_START',
  'PENALTIES_END',
  'INTERRUPTED',
  'POSTPONED',
  'CANCELED'
);

ALTER TABLE "Match"
  ALTER COLUMN "status" TYPE "MatchStatus"
  USING (
    CASE "status"::text
      WHEN 'PENALTIES' THEN 'PENALTIES_END'
      ELSE "status"::text
    END
  )::"MatchStatus";

ALTER TABLE "Match" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

DROP TYPE "MatchStatus_old";
