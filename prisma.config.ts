import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // 👇 Ganti ts-node menjadi tsx di sini
    seed: "npx tsx prisma/seed.ts", 
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});