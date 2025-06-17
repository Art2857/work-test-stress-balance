import { UserRepository } from './repository/user.repository';
import { UserService } from './services/user.service';
import { UserController } from './api/user.controller';

export function createUserModuleWithDependencies() {
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  return {
    userController,
    userRepository,
    userService,
  };
}
