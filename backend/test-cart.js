import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["query", "error", "info", "warn"] });

async function main() {
  try {
    const cart = await prisma.cart.findFirst();
    console.log("Cart table exists. Cart count:", cart ? 1 : 0);
  } catch (err) {
    console.error("Cart query failed with code:", err.code);
  } finally {
    await prisma.$disconnect();
  }
}

main();
