import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    errorFormat: "colorless",
  });

export const db = global.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  global.__prisma = db;
}

export default db;
