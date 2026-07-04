import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 * Usage: router.post('/', validate(MySchema), controller)
 */
export const validate =
  (schema: AnyZodObject, target: ValidationTarget = 'body') =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      // Replace raw input with parsed/transformed data
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: err.flatten().fieldErrors,
        });
        return;
      }
      next(err);
    }
  };

export const validateQuery = (schema: AnyZodObject) =>
  validate(schema, 'query');

export const validateParams = (schema: AnyZodObject) =>
  validate(schema, 'params');
