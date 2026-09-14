-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('DRAFT', 'DRAWN', 'IN_PROGRESS', 'FINISHED');

-- AlterTable
ALTER TABLE "Competition" ADD COLUMN "status" "CompetitionStatus" NOT NULL DEFAULT 'DRAFT';
