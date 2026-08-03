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

router.patch("/:id", validate(warehouseSchema.partial()), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.warehouse.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Warehouse not found" });

    if (req.body.code && req.body.code.toUpperCase() !== existing.code) {
      const existingCode = await db.warehouse.findUnique({ where: { code: req.body.code.toUpperCase() } });
      if (existingCode) return res.status(409).json({ success: false, message: "Warehouse code already exists" });
    }

    const warehouse = await db.warehouse.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, data: warehouse, message: "Warehouse updated" });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.warehouse.delete({ where: { id } });
    res.json({ success: true, message: "Warehouse deleted" });
  } catch (error) { next(error); }
});

export default router;
