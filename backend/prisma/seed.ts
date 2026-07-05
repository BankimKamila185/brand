/**
 * Prisma Seed Script
 * Imports products from the frontend's products.json into PostgreSQL.
 * Run: npm run prisma:seed
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

interface RawVariant {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  sku: string | null;
  price: string;
  compare_at_price: string | null;
  grams: number;
  requires_shipping: boolean;
  taxable: boolean;
  available: boolean;
  position: number;
}

interface RawImage {
  id: number;
  src: string;
  width: number;
  height: number;
  position: number;
  alt: string | null;
  variant_ids: number[];
}

interface RawProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: RawVariant[];
  images: RawImage[];
}

async function main() {
  console.log('🌱 Starting database seed...');

  // ── 1. Admin user ────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await db.user.upsert({
    where: { email: 'admin@tevar.in' },
    update: {},
    create: {
      name: 'Tevar Admin',
      email: 'admin@tevar.in',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ── 2. Default collections ────────────────────────────────────────────────
  const collectionsData = [
    { name: 'All', handle: 'all', description: 'All products', sortOrder: 0 },
    { name: 'Bestsellers', handle: 'bestsellers', sortOrder: 1 },
    { name: "What's New", handle: 'whats-new', sortOrder: 2 },
    { name: 'Outliers Recommends', handle: 'outliers-recommends', sortOrder: 3 },
    { name: 'Retro Clothing', handle: 'retro-clothing', sortOrder: 4 },
    { name: 'Outliers K-aracter', handle: 'outliers-k-aracter', sortOrder: 5 },
    { name: 'Winterwear', handle: 'winterwear', sortOrder: 6 },
    { name: 'Outerwear', handle: 'outerwear', sortOrder: 7 },
  ];

  const collectionMap = new Map<string, string>();
  for (const col of collectionsData) {
    const c = await db.collection.upsert({
      where: { handle: col.handle },
      update: {},
      create: { ...col, isActive: true },
    });
    collectionMap.set(col.handle, c.id);
  }
  console.log(`✅ Collections: ${collectionMap.size}`);

  // ── 3. Default categories ─────────────────────────────────────────────────
  const categoriesData = [
    { name: 'Cargo Trousers', slug: 'cargo-trousers-for-men', sortOrder: 1 },
    { name: 'Co-Ord Sets', slug: 'co-ord-sets', sortOrder: 2 },
    { name: 'Shirts', slug: 'shirts', sortOrder: 3 },
    { name: 'T-Shirts', slug: 'oversized-t-shirts', sortOrder: 4 },
    { name: 'Korean Pants', slug: 'korean-pants', sortOrder: 5 },
    { name: 'Crochet Shirts', slug: 'crochet-shirts', sortOrder: 6 },
    { name: 'Cuban Shirts', slug: 'cuban-shirts', sortOrder: 7 },
    { name: 'Linen Shirts', slug: 'linen-shirts', sortOrder: 8 },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const c = await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
    categoryMap.set(cat.slug, c.id);
  }
  console.log(`✅ Categories: ${categoryMap.size}`);

  // ── 4. Products from products.json ────────────────────────────────────────
  // Resolve path relative to this seed file
  const jsonPath = path.resolve(__dirname, '../../src/data/products.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.warn(`⚠️  products.json not found at ${jsonPath}. Skipping product seed.`);
    console.warn('   Place products.json at: src/data/products.json relative to workspace root');
    return;
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as { products: RawProduct[] };
  const products = raw.products;
  console.log(`📦 Seeding ${products.length} products...`);

  let seeded = 0;
  let skipped = 0;

  for (const p of products) {
    // Check if already seeded
    const existing = await db.product.findUnique({ where: { handle: p.handle } });
    if (existing) { skipped++; continue; }

    // Guess category from product_type
    const categorySlug = getCategorySlug(p.product_type);
    const categoryId = categorySlug ? categoryMap.get(categorySlug) : undefined;

    // Determine collections
    const productCollections: string[] = ['all'];
    const tags = p.tags || [];
    if (tags.some(t => ['bestseller', 'best-seller', 'trending'].includes(t.toLowerCase()))) {
      productCollections.push('bestsellers');
    }
    if (tags.some(t => ['new', 'new-arrival', 'whats-new'].includes(t.toLowerCase()))) {
      productCollections.push('whats-new');
    }

    try {
      await db.product.create({
        data: {
          title: p.title,
          handle: p.handle,
          description: p.body_html,
          vendor: p.vendor || 'Tevar',
          productType: p.product_type || '',
          tags: tags,
          isActive: true,
          publishedAt: new Date(),
          ...(categoryId && { categoryId }),
          collections: {
            create: productCollections
              .filter(h => collectionMap.has(h))
              .map(h => ({ collectionId: collectionMap.get(h)! })),
          },
          variants: {
            create: p.variants.map((v) => ({
              sku: v.sku || undefined,
              title: v.title,
              option1: v.option1 || undefined,
              option2: v.option2 || undefined,
              option3: v.option3 || undefined,
              price: parseFloat(v.price) || 0,
              comparePrice: v.compare_at_price ? parseFloat(v.compare_at_price) : undefined,
              weight: v.grams || 0,
              position: v.position || 1,
              requiresShipping: v.requires_shipping ?? true,
              taxable: v.taxable ?? true,
              isActive: true,
              inventory: {
                create: { quantity: v.available ? 50 : 0 },
              },
            })),
          },
          images: {
            create: p.images.map((img) => ({
              src: img.src,
              altText: img.alt || p.title,
              width: img.width || 0,
              height: img.height || 0,
              position: img.position || 1,
            })),
          },
        },
      });
      seeded++;
    } catch (err) {
      console.error(`  ❌ Failed to seed product "${p.title}":`, err);
    }
  }

  console.log(`✅ Products seeded: ${seeded}, skipped (already exist): ${skipped}`);

  // ── 5. Sample coupons ─────────────────────────────────────────────────────
  const coupons = [
    {
      code: 'WELCOME10',
      description: '10% off on your first order',
      discountType: 'PERCENTAGE' as const,
      value: 10,
      minOrderValue: 500,
      maxDiscount: 200,
      usageLimit: 1000,
    },
    {
      code: 'FLAT100',
      description: '₹100 off on orders above ₹999',
      discountType: 'FLAT' as const,
      value: 100,
      minOrderValue: 999,
    },
    {
      code: 'TEVAR20',
      description: '20% off sitewide',
      discountType: 'PERCENTAGE' as const,
      value: 20,
      minOrderValue: 1499,
      maxDiscount: 500,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const coupon of coupons) {
    await db.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: { ...coupon, isActive: true },
    });
  }
  console.log(`✅ Sample coupons seeded`);

  console.log('\n🎉 Seed complete!');
  console.log('   Admin login: admin@tevar.in / Admin@123');
  console.log('   ⚠️  Change the admin password immediately after first login!');
}

function getCategorySlug(productType: string): string | null {
  const type = productType.toLowerCase();
  if (type.includes('cargo')) return 'cargo-trousers-for-men';
  if (type.includes('co-ord') || type.includes('coord')) return 'co-ord-sets';
  if (type.includes('crochet')) return 'crochet-shirts';
  if (type.includes('cuban')) return 'cuban-shirts';
  if (type.includes('linen')) return 'linen-shirts';
  if (type.includes('shirt')) return 'shirts';
  if (type.includes('t-shirt') || type.includes('tshirt') || type.includes('oversized')) return 'oversized-t-shirts';
  if (type.includes('korean') || type.includes('pant')) return 'korean-pants';
  return null;
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
