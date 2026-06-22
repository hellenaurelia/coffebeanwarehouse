import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// PrismaPg menerima connection string langsung — tidak perlu `Pool` dari `pg`.
// Mengimpor `pg` secara langsung bikin Turbopack mencoba mem-bundle modul Node
// (dns/net/tls/fs) ke browser dan build gagal. Adapter ini menanganinya sendiri.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}