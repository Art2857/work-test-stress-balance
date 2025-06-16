import { UserRepository } from '../repository/user.repository';

export interface SetBalanceCommand {
  userId: number;
  balance: number;
}

export interface SetBalanceResult {
  userId: number;
  newBalance: number;
}

export class SetBalanceUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: SetBalanceCommand): Promise<SetBalanceResult> {
    const { userId, balance } = command;

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
