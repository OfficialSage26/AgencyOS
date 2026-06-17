import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Reuse a single PrismaClient across hot reloads in development to avoid
// exhausting the database connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Supabase presents a certificate chain that node-postgres treats as
  // self-signed. Strip any `sslmode` from the URL and configure SSL on the
  // adapter so the connection is still encrypted but does not fail chain
  // verification. (Prisma's CLI handles SSL separately, hence migrations work
  // even without this.)
  const connectionString = (process.env.DATABASE_URL ?? "").replace(/[?&]sslmode=[^&]*/, "");
  const adapter = new PrismaPg({ connectionString, ssl: { rejectUnauthorized: false } });
  return new PrismaClient({
    adapter,
    // Query-level logging is noisy and adds per-query I/O overhead; keep it off
    // and only surface warnings/errors. Flip on "query" temporarily when debugging.
    log: ["warn", "error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
