import { AppError, NotFoundError } from '../../../shared/errors/app-errors';
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InsufficientBalanceError extends DomainError {
  readonly code = 'INSUFFICIENT_BALANCE';

  constructor() {
    super('Insufficient balance for this operation');
  }
}

export class NegativeBalanceError extends DomainError {
  readonly code = 'NEGATIVE_BALANCE';

  constructor() {
    super('Balance cannot be negative');
  }
}
export class UserNotFoundError extends NotFoundError {
  constructor(userId: number) {
    super(`User with id ${userId} not found`);
  }
}

export class InsufficientFundsError extends AppError {
  readonly statusCode = 400;
  readonly code = 'INSUFFICIENT_FUNDS';

  constructor() {
    super('Insufficient funds');
  }
}
