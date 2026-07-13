export const getPaginationParams = (req, defaultLimit = 20) => {
  const page = Math.max(1, parseInt(req.query["page"]) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query["limit"]) || defaultLimit),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getSortParams = (
  req,
  allowedFields,
  defaultField = "createdAt",
  defaultOrder = "desc",
) => {
  const sortBy = req.query["sortBy"];
  const sortOrder = req.query["sortOrder"] === "asc" ? "asc" : "desc";
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const order = sortBy ? sortOrder : defaultOrder;
  return { [field]: order };
};
