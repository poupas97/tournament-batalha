/*
  Warnings:

  - Added the required column `config` to the `Competition` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CompetitionConfig" AS ENUM ('LEAGUE', 'GROUP');

-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "config" "CompetitionConfig" NOT NULL,
ADD COLUMN     "opponents" INTEGER,
ADD COLUMN     "qualified" INTEGER;
