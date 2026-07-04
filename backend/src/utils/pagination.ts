import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const getPaginationParams = (req: Request, defaultLimit = 20): PaginationParams => {
  const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getSortParams = (
  req: Request,
  allowedFields: string[],
  defaultField = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc',
): Record<string, 'asc' | 'desc'> => {
  const sortBy = req.query['sortBy'] as string;
  const sortOrder = (req.query['sortOrder'] as string) === 'asc' ? 'asc' : 'desc';
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const order = sortBy ? sortOrder : defaultOrder;
  return { [field]: order };
};
