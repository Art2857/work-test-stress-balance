import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { UpdateBalanceResponse, GetBalanceResponse } from './user.validation';

export class UserController {
  constructor(private readonly userService: UserService) {}

  async updateUserBalance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, amount } = req.validatedBody;

      const balanceUpdateResult = await this.userService.updateBalance(
        userId,
        amount
      );

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

      const balanceSetResult = await this.userService.setBalance(
        userId,
        balance
      );

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

      const userBalanceData = await this.userService.getBalance(userId);

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
