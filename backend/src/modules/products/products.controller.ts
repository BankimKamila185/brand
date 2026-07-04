import { Request, Response } from 'express';
import { productsService } from './products.service';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendSuccess as sendOk } from '../../utils/response';

export const productsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { products, meta } = await productsService.list(req.query as never);
    sendSuccess(res, products, 'Products fetched', 200, meta);
  }),

  getByHandle: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.findByHandle(req.params['handle'] as string);
    sendSuccess(res, product);
  }),

  search: asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query['q'] as string) || '';
    const limit = parseInt(req.query['limit'] as string) || 10;
    const results = await productsService.search(q, limit);
    sendSuccess(res, results);
  }),

  getRelated: asyncHandler(async (req: Request, res: Response) => {
    const related = await productsService.getRelated(req.params['id'] as string);
    sendSuccess(res, related);
  }),

  // Admin
  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.create(req.body);
    sendCreated(res, product, 'Product created');
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.update(req.params['id'] as string, req.body);
    sendOk(res, product, 'Product updated');
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await productsService.softDelete(req.params['id'] as string);
    sendSuccess(res, null, 'Product deleted');
  }),
};
