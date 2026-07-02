import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  try {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  } catch {
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
