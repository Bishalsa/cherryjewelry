import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Disable strict TLS check for self-signed certificates (Supabase pooler requirement)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  } catch (e) {
    console.error("Prisma Client Initialization Error:", e);
    // If PrismaClient fails to initialize (e.g., missing adapter/accelerateUrl
    // during build), return a proxy that throws on any database call.
    // This allows the app to build and fall back to sample data.
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        // Allow basic property access needed during module resolution
        if (prop === "then" || prop === Symbol.toPrimitive || prop === "$$typeof") {
          return undefined;
        }
        // Return a proxy for model access (e.g., prisma.product)
        return new Proxy(
          {},
          {
            get() {
              return async () => {
                throw new Error("Database not available");
              };
            },
          }
        );
      },
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
