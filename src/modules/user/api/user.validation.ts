import { z } from 'zod';
import {
  PositiveIntegerSchema,
  FiniteNumberSchema,
  NonNegativeNumberSchema,
  createIdSchema,
} from '../../../shared/validation/base.validation';

const userIdSchema = createIdSchema('пользователя');

const nonZeroAmountSchema = FiniteNumberSchema.refine(val => val !== 0, {
  message: 'amount cannot be zero',
});

const nonNegativeBalanceSchema = NonNegativeNumberSchema;
export const updateBalanceRequestSchema = z.object({
  userId: userIdSchema,
  amount: nonZeroAmountSchema,
});

export const setBalanceRequestSchema = z.object({
  userId: userIdSchema,
  balance: nonNegativeBalanceSchema,
});

export const getUserBalanceParamsSchema = z.object({
  userId: userIdSchema,
});
export type UpdateBalanceRequest = z.infer<typeof updateBalanceRequestSchema>;
export type SetBalanceRequest = z.infer<typeof setBalanceRequestSchema>;
export type GetBalanceParams = z.infer<typeof getUserBalanceParamsSchema>;
export const updateBalanceResponseSchema = z.object({
  success: z.literal(true),
  userId: userIdSchema,
  balance: z.number(),
});

export const getBalanceResponseSchema = z.object({
  userId: userIdSchema,
  balance: z.number(),
});

export type UpdateBalanceResponse = z.infer<typeof updateBalanceResponseSchema>;
export type GetBalanceResponse = z.infer<typeof getBalanceResponseSchema>;
