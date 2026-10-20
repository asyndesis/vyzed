import { PrismaClient } from "@prisma/client";

// DATABASE_URL is read from schema.prisma's env() when the first query runs,
// so importing this module (e.g. during the client build) needs no secrets.
const createPrismaClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
