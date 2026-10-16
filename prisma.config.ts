import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

const envFile =
  process.env.NODE_ENV === "production" ? ".env.prd" : ".env.local";

config({ path: envFile });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --project prisma/tsconfig.seed.json prisma/seed.ts",
  },
});
