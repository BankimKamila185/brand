import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient({ log: ["query", "error", "info", "warn"] });

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        passwordHash: "dummyhash",
        emailVerifyToken: crypto.randomBytes(32).toString("hex"),
        emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    console.log("User created:", user.id);
    
    await prisma.cart.create({ data: { userId: user.id } });
    console.log("Cart created");
  } catch (err) {
    console.error("Prisma error:", err.constructor.name);
    console.error("Error message:", err.message);
    if (err.code) {
      console.error("Error code:", err.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
