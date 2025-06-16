import { InsufficientBalanceError, NegativeBalanceError } from './user.errors';

export class User {
  constructor(
    private readonly _id: number,
    private readonly _balance: number
  ) {
    this.validateBalance(_balance);
  }

  get id(): number {
    return this._id;
  }

  get balance(): number {
    return this._balance;
  }

  public updateBalance(amount: number): User {
    const newBalance = this._balance + amount;
    this.validateBalance(newBalance);

    return new User(this._id, newBalance);
  }

  public canAfford(amount: number): boolean {
    return this._balance >= Math.abs(amount);
  }

  private validateBalance(balance: number): void {
    if (balance < 0) {
      throw new NegativeBalanceError();
    }
  }

  public validateWithdrawal(amount: number): void {
    if (amount > 0) {
      throw new Error('Withdrawal amount must be negative');
    }

    if (!this.canAfford(Math.abs(amount))) {
      throw new InsufficientBalanceError();
    }
  }

  public equals(other: User): boolean {
    return this._id === other._id;
  }

  public toString(): string {
    return `User(id=${this._id}, balance=${this._balance})`;
  }
}
