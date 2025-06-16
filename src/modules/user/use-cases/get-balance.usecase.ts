import { UserRepository } from '../repository/user.repository';
import { UserNotFoundError } from '../domain/user.errors';

export interface GetBalanceQuery {
  userId: number;
}

export interface GetBalanceResult {
  userId: number;
  balance: number;
}

export class GetBalanceUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetBalanceQuery): Promise<GetBalanceResult> {
    const { userId } = query;

    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) {
      throw new UserNotFoundError(userId);
    }

    return {
      userId: existingUser.id,
      balance: existingUser.balance,
    };
  }
}
