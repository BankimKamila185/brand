import { db } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { buildPaginationMeta } from "../../utils/response";
import { uploadBase64ToR2, normalizeR2Url } from "../../config/r2";

function sanitizeProduct(product) {
  if (!product) return product;
  if (Array.isArray(product.images)) {
    product.images = product.images.map((img) => ({
      ...img,
      src: normalizeR2Url(img.src),
    }));
  }
  return product;
}

function sanitizeProducts(products) {
  if (!Array.isArray(products)) return products;
  return products.map(sanitizeProduct);
}

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
  careInstructions: true,
  manufacturerDetails: true,
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

    return { products: sanitizeProducts(products), meta: buildPaginationMeta(total, page, limit) };
  },

  async findByHandle(handle) {
    const product = await db.product.findFirst({
      where: { handle, isActive: true },
      select: productDetailSelect,
    });

    if (!product) throw new AppError("Product not found", 404);
    return sanitizeProduct(product);
  },

  async findById(id) {
    const product = await db.product.findUnique({
      where: { id },
      select: productDetailSelect,
    });
    if (!product) throw new AppError("Product not found", 404);
    return sanitizeProduct(product);
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
    return sanitizeProducts(products);
  },

  async create(data) {
    const existing = await db.product.findUnique({
      where: { handle: data.handle },
    });
    if (existing)
      throw new AppError("A product with this handle already exists", 409);

    // Verify category exists if provided
    let categoryId = undefined;
    if (data.categoryId) {
      const category = await db.category.findUnique({ where: { id: data.categoryId } });
      if (category) categoryId = category.id;
    }

    // Verify collections exist if provided
    const validCollectionIds = [];
    if (data.collectionIds && data.collectionIds.length > 0) {
      const foundCols = await db.collection.findMany({
        where: { id: { in: data.collectionIds.filter(Boolean) } },
        select: { id: true },
      });
      validCollectionIds.push(...foundCols.map((c) => c.id));
    }

    // Upload base64 images to Cloudflare R2 sequentially
    const uploadedImages = [];
    if (Array.isArray(data.images)) {
      for (let i = 0; i < data.images.length; i++) {
        const image = data.images[i];
        if (!image || !image.src) continue;
        const url = await uploadBase64ToR2(image.src, "products");
        uploadedImages.push({
          src: url,
          altText: image.altText || data.title,
          position: image.position || i + 1,
        });
      }
    }

    const product = await db.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          title: data.title,
          handle: data.handle,
          description: data.description || "",
          careInstructions: data.careInstructions || null,
          manufacturerDetails: data.manufacturerDetails || null,
          vendor: data.vendor || "Tevar",
          productType: data.productType || "",
          tags: data.tags || [],
          categoryId: categoryId,
          collections: {
            create: validCollectionIds.map((id) => ({ collectionId: id })),
          },
          variants: {
            create: (data.variants || []).map((v, i) => {
              const formattedSku = v.sku && typeof v.sku === "string" && v.sku.trim() ? v.sku.trim() : null;
              return {
                sku: formattedSku,
                title: v.title || v.option1 || "Default",
                option1: v.option1 || v.title || "Default",
                option2: v.option2 || null,
                option3: v.option3 || null,
                price: v.price,
                comparePrice: v.comparePrice || null,
                weight: v.weight || 0,
                position: i + 1,
                inventory: {
                  create: {
                    quantity: v.warehouseStocks?.length
                      ? v.warehouseStocks.reduce((total, stock) => total + stock.quantity, 0)
                      : v.stock || 0,
                  },
                },
                warehouseStocks: v.warehouseStocks?.length
                  ? {
                      create: v.warehouseStocks
                        .filter((ws) => ws.warehouseId)
                        .map((ws) => ({ warehouseId: ws.warehouseId, quantity: ws.quantity })),
                    }
                  : undefined,
              };
            }),
          },
          images: {
            create: uploadedImages,
          },
        },
        select: productDetailSelect,
      });
      return created;
    });

    return sanitizeProduct(product);
  },

  async update(id, data) {
    const existing = await db.product.findUnique({
      where: { id },
      include: { variants: { where: { isActive: true } }, images: true },
    });
    if (!existing) throw new AppError("Product not found", 404);

    // Verify category exists if provided
    let categoryId = undefined;
    if (data.categoryId) {
      const category = await db.category.findUnique({ where: { id: data.categoryId } });
      if (category) categoryId = category.id;
    }

    // Verify collections exist if provided
    let validCollectionIds = null;
    if (data.collectionIds) {
      const foundCols = await db.collection.findMany({
        where: { id: { in: data.collectionIds.filter(Boolean) } },
        select: { id: true },
      });
      validCollectionIds = foundCols.map((c) => c.id);
    }

    // Upload base64 images to R2 sequentially
    let uploadedImages = null;
    if (Array.isArray(data.images)) {
      uploadedImages = [];
      for (let i = 0; i < data.images.length; i++) {
        const image = data.images[i];
        if (!image || !image.src) continue;
        const url = await uploadBase64ToR2(image.src, "products");
        uploadedImages.push({
          src: url,
          altText: image.altText || data.title || existing.title,
          position: i + 1,
        });
      }
    }

    await db.$transaction(async (tx) => {
      // 1. Update basic product info
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description !== undefined ? data.description : undefined,
          careInstructions: data.careInstructions !== undefined ? data.careInstructions : undefined,
          manufacturerDetails: data.manufacturerDetails !== undefined ? data.manufacturerDetails : undefined,
          vendor: data.vendor !== undefined ? data.vendor : undefined,
          productType: data.productType !== undefined ? data.productType : undefined,
          categoryId: categoryId,
          isActive: data.isActive !== undefined ? data.isActive : undefined,
        },
      });

      // 1b. Update collections mapping
      if (validCollectionIds !== null) {
        await tx.productCollection.deleteMany({ where: { productId: id } });
        await tx.productCollection.createMany({
          data: validCollectionIds.map((colId) => ({
            productId: id,
            collectionId: colId,
          })),
        });
      }

      // 2. Update images
      if (uploadedImages) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: uploadedImages.map((img) => ({
            productId: id,
            src: img.src,
            altText: img.altText,
            position: img.position,
          })),
        });
      }

      // 3. Update variants and warehouse stocks
      if (data.variants) {
        const activeOption1s = data.variants.map((v) => v.option1).filter(Boolean);

        // Mark removed variants as inactive
        await tx.productVariant.updateMany({
          where: {
            productId: id,
            option1: { notIn: activeOption1s },
          },
          data: { isActive: false },
        });

        for (const v of data.variants) {
          const formattedSku = v.sku && typeof v.sku === "string" && v.sku.trim() ? v.sku.trim() : null;
          const existingVariant = await tx.productVariant.findFirst({
            where: { productId: id, option1: v.option1 },
          });

          if (existingVariant) {
            // Update existing variant
            await tx.productVariant.update({
              where: { id: existingVariant.id },
              data: {
                price: v.price,
                comparePrice: v.comparePrice || null,
                sku: formattedSku,
                isActive: true,
              },
            });

            // Update inventory
            if (v.stock !== undefined) {
              await tx.inventory.update({
                where: { variantId: existingVariant.id },
                data: { quantity: v.stock },
              });

              if (data.warehouseId) {
                await tx.warehouseInventory.upsert({
                  where: {
                    warehouseId_variantId: {
                      warehouseId: data.warehouseId,
                      variantId: existingVariant.id,
                    },
                  },
                  create: {
                    warehouseId: data.warehouseId,
                    variantId: existingVariant.id,
                    quantity: v.stock,
                  },
                  update: {
                    quantity: v.stock,
                  },
                });
              }
            }
          } else {
            // Create new variant
            const newVar = await tx.productVariant.create({
              data: {
                productId: id,
                title: v.title || v.option1 || "Default",
                option1: v.option1 || v.title || "Default",
                price: v.price,
                comparePrice: v.comparePrice || null,
                sku: formattedSku,
                isActive: true,
                inventory: {
                  create: { quantity: v.stock || 0 },
                },
              },
            });

            if (data.warehouseId && v.stock !== undefined) {
              await tx.warehouseInventory.create({
                data: {
                  warehouseId: data.warehouseId,
                  variantId: newVar.id,
                  quantity: v.stock,
                },
              });
            }
          }
        }
      }

      return updatedProduct;
    });

    // Return full updated product structure
    const updated = await db.product.findUnique({
      where: { id },
      select: productDetailSelect,
    });
    return sanitizeProduct(updated);
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

    const related = await db.product.findMany({
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
    return sanitizeProducts(related);
  },
};
