import { ZodError } from "zod";

/**
 * Zod validation middleware factory.
 * Usage: router.post('/', validate(MySchema), controller)
 */
export const validate =
  (schema, target = "body") =>
  async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      // Replace raw input with parsed/transformed data
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: err.flatten().fieldErrors,
        });
        return;
      }
      next(err);
    }
  };

export const validateQuery = (schema) => validate(schema, "query");

export const validateParams = (schema) => validate(schema, "params");
