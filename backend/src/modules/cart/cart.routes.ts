import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/database';
import { asyncHandler, AppError } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { sendSuccess, sendCreated } from '../../utils/response';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// GET /api/cart — get current user's cart
router.get('/', asyncHandler(async (req, res) => {
  let cart = await db.cart.findUnique({
    where: { userId: req.user!.sub },
    select: {
      id: true,
      items: {
        select: {
          id: true, quantity: true,
          variant: {
            select: {
              id: true, title: true, option1: true, option2: true,
              price: true, comparePrice: true,
              product: {
                select: {
                  id: true, title: true, handle: true,
                  images: { select: { src: true, altText: true }, take: 1, orderBy: { position: 'asc' } },
                },
              },
              inventory: { select: { quantity: true } },
            },
          },
        },
      },
    },
  });

  // Create cart if it doesn't exist (shouldn't happen after registration)
  if (!cart) {
    await db.cart.create({
      data: { userId: req.user!.sub },
    });
    sendSuccess(res, { id: null, items: [] });
    return;
  }

  sendSuccess(res, cart);
}));

const addItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(10).default(1),
});

// POST /api/cart/items — add item
router.post('/items', validate(addItemSchema), asyncHandler(async (req, res) => {
  const { variantId, quantity } = req.body as { variantId: string; quantity: number };

  // Check variant exists and has stock
  const variant = await db.productVariant.findUnique({
    where: { id: variantId, isActive: true },
    select: { id: true, inventory: { select: { quantity: true, reserved: true } } },
  });
  if (!variant) throw new AppError('Product variant not found', 404);

  const available = (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0);
  if (available < quantity) throw new AppError(`Only ${available} units available`, 400);

  let cart = await db.cart.findUnique({ where: { userId: req.user!.sub } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId: req.user!.sub } });
  }

  const existingItem = await db.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > available) throw new AppError(`Only ${available} units available`, 400);
    const updated = await db.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
      select: { id: true, quantity: true, variantId: true },
    });
    sendSuccess(res, updated, 'Cart updated');
  } else {
    const item = await db.cartItem.create({
      data: { cartId: cart.id, variantId, quantity },
      select: { id: true, quantity: true, variantId: true },
    });
    sendCreated(res, item, 'Item added to cart');
  }
}));

const updateItemSchema = z.object({
  quantity: z.number().int().min(0).max(10),
});

// PATCH /api/cart/items/:itemId — update quantity (0 = remove)
router.patch('/items/:itemId', validate(updateItemSchema), asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body as { quantity: number };

  const item = await db.cartItem.findFirst({
    where: { id: itemId as string, cart: { userId: req.user!.sub } },
  });
  if (!item) throw new AppError('Cart item not found', 404);

  if (quantity === 0) {
    await db.cartItem.delete({ where: { id: itemId as string } });
    sendSuccess(res, null, 'Item removed from cart');
    return;
  }

  const updated = await db.cartItem.update({
    where: { id: itemId as string },
    data: { quantity },
    select: { id: true, quantity: true },
  });
  sendSuccess(res, updated, 'Cart updated');
}));

// DELETE /api/cart/items/:itemId — remove specific item
router.delete('/items/:itemId', asyncHandler(async (req, res) => {
  const item = await db.cartItem.findFirst({
    where: { id: req.params['itemId'] as string, cart: { userId: req.user!.sub } },
  });
  if (!item) throw new AppError('Cart item not found', 404);
  await db.cartItem.delete({ where: { id: item.id } });
  sendSuccess(res, null, 'Item removed');
}));

// DELETE /api/cart — clear entire cart
router.delete('/', asyncHandler(async (req, res) => {
  const cart = await db.cart.findUnique({ where: { userId: req.user!.sub } });
  if (cart) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  sendSuccess(res, null, 'Cart cleared');
}));

export default router;
