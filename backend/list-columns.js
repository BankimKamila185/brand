import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const columns = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='users'`;
  console.log("Columns in users table:", columns.map(c => c.column_name));
}

main().finally(() => prisma.$disconnect());
