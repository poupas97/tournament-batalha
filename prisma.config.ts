import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

if (process.env.NODE_ENV !== "production") {
  config({ path: ".env.local" });
}

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
