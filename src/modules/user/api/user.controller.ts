import { Request, Response, NextFunction } from 'express';
import { UpdateBalanceUseCase } from '../use-cases/update-balance.usecase';
import { SetBalanceUseCase } from '../use-cases/set-balance.usecase';
import { GetBalanceUseCase } from '../use-cases/get-balance.usecase';
import { UpdateBalanceResponse, GetBalanceResponse } from './user.validation';

export class UserController {
  constructor(
    private readonly updateBalanceUseCase: UpdateBalanceUseCase,
    private readonly setBalanceUseCase: SetBalanceUseCase,
    private readonly getBalanceUseCase: GetBalanceUseCase
  ) {}

  async updateUserBalance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, amount } = req.validatedBody;

      const balanceUpdateResult = await this.updateBalanceUseCase.execute({
        userId,
        amount,
      });

      const successResponse: UpdateBalanceResponse = {
        success: true,
        userId: balanceUpdateResult.userId,
        balance: balanceUpdateResult.newBalance,
      };

      res.status(200).json(successResponse);
    } catch (error) {
      next(error);
    }
  }

  async setUserBalance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, balance } = req.validatedBody;

      const balanceSetResult = await this.setBalanceUseCase.execute({
        userId,
        balance,
      });

      const successResponse: UpdateBalanceResponse = {
        success: true,
        userId: balanceSetResult.userId,
        balance: balanceSetResult.newBalance,
      };

      res.status(200).json(successResponse);
    } catch (error) {
      next(error);
    }
  }

  async getUserBalance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.validatedParams;

      const userBalanceData = await this.getBalanceUseCase.execute({ userId });

      const balanceResponse: GetBalanceResponse = {
        userId: userBalanceData.userId,
        balance: userBalanceData.balance,
      };

      res.status(200).json(balanceResponse);
    } catch (error) {
      next(error);
    }
  }
}
