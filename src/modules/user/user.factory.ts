import { UserRepository } from './repository/user.repository';
import { UpdateBalanceUseCase } from './use-cases/update-balance.usecase';
import { SetBalanceUseCase } from './use-cases/set-balance.usecase';
import { GetBalanceUseCase } from './use-cases/get-balance.usecase';
import { UserController } from './api/user.controller';

export function createUserModuleWithDependencies() {
  const userRepository = new UserRepository();

  const updateBalanceUseCase = new UpdateBalanceUseCase(userRepository);
  const setBalanceUseCase = new SetBalanceUseCase(userRepository);
  const getBalanceUseCase = new GetBalanceUseCase(userRepository);

  const userBalanceController = new UserController(
    updateBalanceUseCase,
    setBalanceUseCase,
    getBalanceUseCase
  );

  return {
    userController: userBalanceController,
    userRepository,
    updateBalanceUseCase,
    setBalanceUseCase,
    getBalanceUseCase,
  };
}
