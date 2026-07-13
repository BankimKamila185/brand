export const sendSuccess = (
  res,
  data,
  message = "Success",
  statusCode = 200,
  meta,
) => {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

export const sendCreated = (res, data, message = "Created successfully") =>
  sendSuccess(res, data, message, 201);

export const sendError = (res, message, statusCode = 500, errors) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

export const sendNotFound = (res, message = "Resource not found") =>
  sendError(res, message, 404);

export const sendUnauthorized = (res, message = "Unauthorized") =>
  sendError(res, message, 401);

export const sendForbidden = (res, message = "Forbidden") =>
  sendError(res, message, 403);

export const sendBadRequest = (res, message, errors) =>
  sendError(res, message, 400, errors);

export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});
