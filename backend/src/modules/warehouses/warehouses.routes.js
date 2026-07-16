import { Router } from "express";
import { z } from "zod";
import { db } from "../../config/database";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validate } from "../../middleware/validate";

const router = Router();
const warehouseSchema = z.object({ name: z.string().min(2).max(120), code: z.string().min(2).max(40).regex(/^[A-Z0-9-]+$/), address: z.string().max(255).optional() });

router.use(authenticate, requireAdmin);

router.get("/", async (_req, res, next) => {
  try {
    const warehouses = await db.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { stocks: { include: { variant: { select: { title: true, option1: true, product: { select: { title: true } } } } } } },
    });
    res.json({ success: true, data: warehouses });
  } catch (error) { next(error); }
});

router.post("/", validate(warehouseSchema), async (req, res, next) => {
  try {
    const warehouse = await db.warehouse.create({ data: req.body });
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) { next(error); }
});

export default router;
