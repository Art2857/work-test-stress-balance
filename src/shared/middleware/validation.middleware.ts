import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../errors/app-errors';

type ValidationTarget = 'body' | 'params' | 'query';

declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      validatedParams?: any;
      validatedQuery?: any;
    }
  }
}

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  target: ValidationTarget = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = getDataFromRequest(req, target);

      const processedData =
        target === 'params'
          ? processParamsData(dataToValidate)
          : dataToValidate;

      const validatedData = schema.parse(processedData);

      setValidatedData(req, target, validatedData);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = formatZodError(error);
        next(new ValidationError(errorMessage));
      } else {
        next(error);
      }
    }
  };
}

function getDataFromRequest(req: Request, target: ValidationTarget): any {
  switch (target) {
    case 'body':
      return req.body;
    case 'params':
      return req.params;
    case 'query':
      return req.query;
    default:
      throw new Error(`Unknown validation target: ${target}`);
  }
}

function setValidatedData(
  req: Request,
  target: ValidationTarget,
  data: any
): void {
  switch (target) {
    case 'body':
      req.validatedBody = data;
      break;
    case 'params':
      req.validatedParams = data;
      break;
    case 'query':
      req.validatedQuery = data;
      break;
  }
}

function processParamsData(data: any): any {
  const processed = { ...data };

  Object.keys(processed).forEach(key => {
    const value = processed[key];
    if (typeof value === 'string' && !isNaN(Number(value))) {
      processed[key] = Number(value);
    }
  });

  return processed;
}

function formatZodError(error: ZodError): string {
  const messages = error.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return messages.join(', ');
}
