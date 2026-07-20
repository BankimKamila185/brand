import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["query", "error", "info", "warn"] });

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Database connection successful. User count:", user ? 1 : 0);
  } catch (err) {
    console.error("Database query failed:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
