import { z } from 'zod';

export const PositiveIntegerSchema = z.number().int().positive();
export const NonNegativeNumberSchema = z.number().finite().nonnegative();
export const FiniteNumberSchema = z.number().finite();

export const createIdSchema = (entityName: string) =>
  PositiveIntegerSchema.describe(`ID ${entityName}`);
