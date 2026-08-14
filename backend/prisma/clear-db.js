import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🧹 Wiping all data from database (orders, products, coupons, categories, collections, carts, reviews, non-admin users)...");

  // Delete transactional data first due to FK constraints
  await db.orderItem.deleteMany({});
  await db.payment.deleteMany({});
  await db.order.deleteMany({});
  await db.cartItem.deleteMany({});
  await db.cart.deleteMany({});
  await db.wishlistItem.deleteMany({});
  await db.review.deleteMany({});
  await db.notification.deleteMany({});
  await db.coupon.deleteMany({});

  // Delete product catalog data
  await db.productImage.deleteMany({});
  await db.productVariant.deleteMany({});
  await db.productCollection.deleteMany({});
  await db.warehouseInventory.deleteMany({});
  await db.inventory.deleteMany({});
  await db.warehouse.deleteMany({});
  await db.product.deleteMany({});
  await db.category.deleteMany({});
  await db.collection.deleteMany({});

  // Delete addresses and non-admin users
  await db.address.deleteMany({});
  await db.user.deleteMany({
    where: {
      role: { notIn: ["ADMIN", "SUPER_ADMIN"] },
    },
  });

  console.log("✨ All data has been cleaned successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error cleaning database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
