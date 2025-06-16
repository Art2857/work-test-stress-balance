import { Sequelize, QueryTypes } from 'sequelize';
import { User } from '../domain/user.entity';
import { sequelize } from '../../../infrastructure/database/connection';
import {
  UserNotFoundError,
  InsufficientFundsError,
} from '../domain/user.errors';

type DatabaseBalanceOperationResult = {
  id: number;
  balance: string;
  success: boolean;
  message: string;
};

export class UserRepository {
  private readonly databaseConnection: Sequelize = sequelize;

  async findUserById(id: number): Promise<User | null> {
    const [userRecord] = await this.databaseConnection.query<{
      id: number;
      balance: string;
    }>('SELECT id, balance FROM users WHERE id = $1', {
      bind: [id],
      type: QueryTypes.SELECT,
    });

    return userRecord
      ? new User(userRecord.id, Number(userRecord.balance))
      : null;
  }

  async updateUserBalance(userId: number, amount: number): Promise<User> {
    const [operationResult] =
      await this.databaseConnection.query<DatabaseBalanceOperationResult>(
        'SELECT * FROM update_user_balance($1, $2)',
        {
          bind: [userId, amount],
          type: QueryTypes.SELECT,
        }
      );

    if (!operationResult.success) {
      this.throwAppropriateError(operationResult.message, userId);
    }

    return new User(operationResult.id, Number(operationResult.balance));
  }

  async setUserBalance(userId: number, balance: number): Promise<User> {
    const [operationResult] =
      await this.databaseConnection.query<DatabaseBalanceOperationResult>(
        'SELECT * FROM set_user_balance($1, $2)',
        {
          bind: [userId, balance],
          type: QueryTypes.SELECT,
        }
      );

    if (!operationResult.success) {
      this.throwAppropriateError(operationResult.message, userId);
    }

    return new User(operationResult.id, Number(operationResult.balance));
  }

  private throwAppropriateError(message: string, userId: number): never {
    switch (message) {
      case 'User not found':
        throw new UserNotFoundError(userId);
      case 'Insufficient balance':
        throw new InsufficientFundsError();
      case 'Balance cannot be negative':
        throw new Error('Balance cannot be negative');
      default:
        throw new Error(message);
    }
  }
}
