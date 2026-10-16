ALTER TABLE "Competition"
ADD COLUMN "color" TEXT;

UPDATE "Competition"
SET "color" = '#' || lpad(to_hex("id"), 6, '0');

ALTER TABLE "Competition"
ALTER COLUMN "color" SET NOT NULL;

CREATE UNIQUE INDEX "Competition_color_key" ON "Competition"("color");
