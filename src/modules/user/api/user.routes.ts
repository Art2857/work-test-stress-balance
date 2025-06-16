import express from 'express';
import { UserController } from './user.controller';
import { validateRequest } from '../../../shared/middleware/validation.middleware';
import {
  updateBalanceRequestSchema,
  setBalanceRequestSchema,
  getUserBalanceParamsSchema,
} from './user.validation';

/**
 * @swagger
 * /api/users/balance:
 *   post:
 *     tags:
 *       - Users
 *     summary: Обновить баланс пользователя
 *     description: Атомарно обновляет баланс пользователя с проверкой на достаточность средств (добавляет к текущему балансу)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBalanceRequest'
 *     responses:
 *       200:
 *         description: Баланс успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateBalanceResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     tags:
 *       - Users
 *     summary: Установить баланс пользователя
 *     description: Устанавливает конкретное значение баланса пользователя (заменяет текущий баланс)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetBalanceRequest'
 *     responses:
 *       200:
 *         description: Баланс успешно установлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateBalanceResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/users/{userId}/balance:
 *   get:
 *     tags:
 *       - Users
 *     summary: Получить баланс пользователя
 *     description: Возвращает текущий баланс указанного пользователя
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID пользователя
 *         example: 1
 *     responses:
 *       200:
 *         description: Баланс пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetBalanceResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

export function createUserRoutes(userBalanceController: UserController) {
  const router = express.Router();

  router.post(
    '/users/balance',
    validateRequest(updateBalanceRequestSchema, 'body'),
    userBalanceController.updateUserBalance.bind(userBalanceController)
  );

  router.put(
    '/users/balance',
    validateRequest(setBalanceRequestSchema, 'body'),
    userBalanceController.setUserBalance.bind(userBalanceController)
  );

  router.get(
    '/users/:userId/balance',
    validateRequest(getUserBalanceParamsSchema, 'params'),
    userBalanceController.getUserBalance.bind(userBalanceController)
  );

  return router;
}
