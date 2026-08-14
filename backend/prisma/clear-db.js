import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🧹 Clearing all products and demo data from database...");
  await db.cartItem.deleteMany({});
  await db.orderItem.deleteMany({});
  await db.review.deleteMany({});
  await db.wishlistItem.deleteMany({});
  await db.productVariant.deleteMany({});
  await db.productImage.deleteMany({});
  await db.productCollection.deleteMany({});
  const res = await db.product.deleteMany({});
  console.log(`✅ Deleted ${res.count} products successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
