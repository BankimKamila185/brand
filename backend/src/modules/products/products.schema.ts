import { z } from 'zod';

export const productQuerySchema = z.object({
  page: z.string().optional().transform(v => parseInt(v || '1') || 1),
  limit: z.string().optional().transform(v => Math.min(100, parseInt(v || '20') || 20)),
  category: z.string().optional(),
  collection: z.string().optional(),
  productType: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  minPrice: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  maxPrice: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  sortBy: z.enum(['price', 'createdAt', 'title', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  available: z.string().optional().transform(v => v === 'true'),
});

export const createProductSchema = z.object({
  title: z.string().min(2).max(255),
  handle: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, 'Handle must be lowercase with hyphens only'),
  description: z.string().optional(),
  vendor: z.string().default('Tevar'),
  productType: z.string().default(''),
  tags: z.array(z.string()).default([]),
  categoryId: z.string().optional(),
  collectionIds: z.array(z.string()).default([]),
  variants: z.array(z.object({
    sku: z.string().optional(),
    title: z.string(),
    option1: z.string().optional(),
    option2: z.string().optional(),
    option3: z.string().optional(),
    price: z.number().positive(),
    comparePrice: z.number().positive().optional(),
    weight: z.number().default(0),
    stock: z.number().int().min(0).default(0),
  })).min(1),
});

export const updateProductSchema = createProductSchema.partial().omit({ handle: true });

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
