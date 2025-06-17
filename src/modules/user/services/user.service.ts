import { UserRepository } from '../repository/user.repository';
import { UserNotFoundError } from '../domain/user.errors';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getBalance(
    userId: number
  ): Promise<{ userId: number; balance: number }> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return {
      userId: user.id,
      balance: user.balance,
    };
  }

  async updateBalance(
    userId: number,
    amount: number
  ): Promise<{ userId: number; newBalance: number }> {
    const userWithUpdatedBalance = await this.userRepository.updateUserBalance(
      userId,
      amount
    );

    return {
      userId: userWithUpdatedBalance.id,
      newBalance: userWithUpdatedBalance.balance,
    };
  }

  async setBalance(
    userId: number,
    balance: number
  ): Promise<{ userId: number; newBalance: number }> {
    const userWithSetBalance = await this.userRepository.setUserBalance(
      userId,
      balance
    );

    return {
      userId: userWithSetBalance.id,
      newBalance: userWithSetBalance.balance,
    };
  }
}
