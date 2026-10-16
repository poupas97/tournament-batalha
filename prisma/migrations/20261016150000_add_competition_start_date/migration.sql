ALTER TABLE "Competition"
ADD COLUMN "startDate" DATE;

UPDATE "Competition"
SET "startDate" = "createdAt"::date;

ALTER TABLE "Competition"
ALTER COLUMN "startDate" SET NOT NULL;
