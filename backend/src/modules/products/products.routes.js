import { Router } from "express";
import { productsController } from "./products.controller.js";
import { validate, validateQuery } from "../../middleware/validate.js";
import { authenticate, requireAdmin } from "../../middleware/auth.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "./products.schema.js";

const router = Router();

// Public
router.post("/notify-restock", productsController.notifyRestock);
router.get("/", validateQuery(productQuerySchema), productsController.list);
router.get("/search", productsController.search);
router.get("/:handle", productsController.getByHandle);
router.get("/:id/related", productsController.getRelated);

// Admin only
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createProductSchema),
  productsController.create,
);
router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validate(updateProductSchema),
  productsController.update,
);
router.delete("/:id", authenticate, requireAdmin, productsController.delete);

export default router;
