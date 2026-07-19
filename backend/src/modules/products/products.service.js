import { db } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { buildPaginationMeta } from "../../utils/response";
import { uploadBase64ToR2 } from "../../config/r2";

// Shared select for product list (lightweight)
const productListSelect = {
  id: true,
  title: true,
  handle: true,
  productType: true,
  vendor: true,
  tags: true,
  isActive: true,
  publishedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  variants: {
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      option1: true,
      option2: true,
      price: true,
      comparePrice: true,
      position: true,
      inventory: { select: { quantity: true, reserved: true } },
    },
    orderBy: { position: "asc" },
  },
  images: {
    select: {
      id: true,
      src: true,
      altText: true,
      width: true,
      height: true,
      position: true,
    },
    orderBy: { position: "asc" },
    take: 2,
  },
  _count: { select: { reviews: true } },
};

// Full select for single product detail
const productDetailSelect = {
  ...productListSelect,
  description: true,
  collections: {
    select: { collection: { select: { id: true, name: true, handle: true } } },
  },
  variants: {
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      sku: true,
      option1: true,
      option2: true,
      option3: true,
      price: true,
      comparePrice: true,
      costPrice: true,
      weight: true,
      position: true,
      taxable: true,
      requiresShipping: true,
      inventory: { select: { quantity: true, reserved: true } },
    },
    orderBy: { position: "asc" },
  },
  images: {
    select: {
      id: true,
      src: true,
      altText: true,
      width: true,
      height: true,
      position: true,
      variantId: true,
    },
    orderBy: { position: "asc" },
  },
};

export const productsService = {
  async list(query) {
    const {
      page,
      limit,
      category,
      collection,
      productType,
      tags,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      search,
      available,
    } = query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(collection && {
        collections: { some: { collection: { handle: collection } } },
      }),
      ...(productType && {
        productType: { contains: productType, mode: "insensitive" },
      }),
      ...(tags && {
        tags: {
          hasSome: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { hasSome: [search] } },
          { vendor: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(available !== undefined && {
        variants: {
          some: { isActive: true, inventory: { quantity: { gt: 0 } } },
        },
      }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        variants: {
          some: {
            isActive: true,
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          },
        },
      }),
    };

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        select: productListSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return { products, meta: buildPaginationMeta(total, page, limit) };
  },

  async findByHandle(handle) {
    const product = await db.product.findFirst({
      where: { handle, isActive: true },
      select: productDetailSelect,
    });

    if (!product) throw new AppError("Product not found", 404);
    return product;
  },

  async findById(id) {
    const product = await db.product.findUnique({
      where: { id },
      select: productDetailSelect,
    });
    if (!product) throw new AppError("Product not found", 404);
    return product;
  },

  async search(query, limit = 10) {
    const products = await db.product.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { productType: { contains: query, mode: "insensitive" } },
          { tags: { hasSome: [query] } },
          { vendor: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        handle: true,
        productType: true,
        images: {
          select: { src: true },
          orderBy: { position: "asc" },
          take: 1,
        },
        variants: {
          select: { price: true, comparePrice: true },
          orderBy: { position: "asc" },
          take: 1,
        },
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
    });
    return products;
  },

  async create(data) {
    const existing = await db.product.findUnique({
      where: { handle: data.handle },
    });
    if (existing)
      throw new AppError("A product with this handle already exists", 409);

    // Upload base64 images to Cloudflare R2 if configured
    const uploadedImages = await Promise.all(
      (data.images || []).map(async (image, i) => {
        const url = await uploadBase64ToR2(image.src, "products");
        return {
          src: url,
          altText: image.altText || data.title,
          position: image.position || i + 1,
        };
      })
    );

    const product = await db.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          title: data.title,
          handle: data.handle,
          description: data.description,
          vendor: data.vendor,
          productType: data.productType,
          tags: data.tags,
          categoryId: data.categoryId,
          collections: {
            create: data.collectionIds.map((id) => ({ collectionId: id })),
          },
          variants: {
            create: data.variants.map((v, i) => ({
              sku: v.sku,
              title: v.title,
              option1: v.option1,
              option2: v.option2,
              option3: v.option3,
              price: v.price,
              comparePrice: v.comparePrice,
              weight: v.weight,
              position: i + 1,
              inventory: { create: { quantity: v.warehouseStocks?.length ? v.warehouseStocks.reduce((total, stock) => total + stock.quantity, 0) : v.stock } },
              warehouseStocks: v.warehouseStocks?.length ? { create: v.warehouseStocks } : undefined,
            })),
          },
          images: {
            create: uploadedImages,
          },
        },
        select: productDetailSelect,
      });
      return created;
    });

    return product;
  },

  async update(id, data) {
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) throw new AppError("Product not found", 404);

    const product = await db.product.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.vendor && { vendor: data.vendor }),
        ...(data.productType !== undefined && {
          productType: data.productType,
        }),
        ...(data.tags && { tags: data.tags }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
      select: productDetailSelect,
    });
    return product;
  },

  async softDelete(id) {
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) throw new AppError("Product not found", 404);
    await db.product.update({ where: { id }, data: { isActive: false } });
  },

  async getRelated(productId, limit = 4) {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, tags: true },
    });
    if (!product) return [];

    return db.product.findMany({
      where: {
        isActive: true,
        id: { not: productId },
        OR: [
          ...(product.categoryId ? [{ categoryId: product.categoryId }] : []),
          ...(product.tags.length ? [{ tags: { hasSome: product.tags } }] : []),
        ],
      },
      select: productListSelect,
      take: limit,
      orderBy: { publishedAt: "desc" },
    });
  },
};
