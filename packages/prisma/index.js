import { PrismaClient } from "@prisma/client";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    __internal: {
      engine: {
        connectionLimit: 5,
        retry: {
          maxRetries: 3,
          initialDelay: 500,
        },
      },
    },
  });

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
