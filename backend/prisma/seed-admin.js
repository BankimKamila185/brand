/**
 * Admin User Seed Script
 * Creates or updates the admin user for the Tevar dashboard.
 * Run: node prisma/seed-admin.js
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@tevar.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Tevar@Admin2025";
const ADMIN_NAME = process.env.ADMIN_NAME || "Tevar Admin";

async function main() {
  console.log("🔐 Setting up admin user...");

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: "SUPER_ADMIN",
      passwordHash,
      name: ADMIN_NAME,
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      name: ADMIN_NAME,
      role: "SUPER_ADMIN",
      emailVerified: true,
    },
  });

  console.log(`✅ Admin user ready:`);
  console.log(`   Email   : ${admin.email}`);
  console.log(`   Role    : ${admin.role}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`\n🚀 Login at: http://localhost:3000/admin/login`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
