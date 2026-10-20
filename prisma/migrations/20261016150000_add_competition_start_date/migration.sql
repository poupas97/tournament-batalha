ALTER TABLE "Competition"
ADD COLUMN "startDate" TIMESTAMP(3);

UPDATE "Competition"
SET "startDate" = "createdAt"::date;

ALTER TABLE "Competition"
ALTER COLUMN "startDate" SET NOT NULL;
