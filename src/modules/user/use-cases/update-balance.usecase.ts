import { UserRepository } from '../repository/user.repository';

export interface UpdateBalanceCommand {
  userId: number;
  amount: number;
}

export interface UpdateBalanceResult {
  userId: number;
  newBalance: number;
}

export class UpdateBalanceUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateBalanceCommand): Promise<UpdateBalanceResult> {
    const { userId, amount } = command;

    const userWithUpdatedBalance = await this.userRepository.updateUserBalance(
      userId,
      amount
    );

    return {
      userId: userWithUpdatedBalance.id,
      newBalance: userWithUpdatedBalance.balance,
    };
  }
}
