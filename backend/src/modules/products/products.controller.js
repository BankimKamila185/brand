import { productsService } from "./products.service";
import { asyncHandler } from "../../middleware/errorHandler";
import {
  sendSuccess,
  sendCreated,
  sendSuccess as sendOk,
} from "../../utils/response";

export const productsController = {
  list: asyncHandler(async (req, res) => {
    const { products, meta } = await productsService.list(req.query);
    sendSuccess(res, products, "Products fetched", 200, meta);
  }),

  getByHandle: asyncHandler(async (req, res) => {
    const product = await productsService.findByHandle(req.params["handle"]);
    sendSuccess(res, product);
  }),

  search: asyncHandler(async (req, res) => {
    const q = req.query["q"] || "";
    const limit = parseInt(req.query["limit"]) || 10;
    const results = await productsService.search(q, limit);
    sendSuccess(res, results);
  }),

  getRelated: asyncHandler(async (req, res) => {
    const related = await productsService.getRelated(req.params["id"]);
    sendSuccess(res, related);
  }),

  // Admin
  create: asyncHandler(async (req, res) => {
    const product = await productsService.create(req.body);
    sendCreated(res, product, "Product created");
  }),

  update: asyncHandler(async (req, res) => {
    const product = await productsService.update(req.params["id"], req.body);
    sendOk(res, product, "Product updated");
  }),

  delete: asyncHandler(async (req, res) => {
    await productsService.softDelete(req.params["id"]);
    sendSuccess(res, null, "Product deleted");
  }),
};
