import { PrismaSavingsRepository, SavingsRepository } from './savings.repository';
import { SavingsAnalytics } from './savings.types';

export class SavingsService {
  constructor(private readonly repo: SavingsRepository = new PrismaSavingsRepository()) {}

  async getAnalytics(): Promise<SavingsAnalytics> {
    const [totalBalance, totalAccounts, depositsCount, withdrawalsCount] = await Promise.all([
      this.repo.sumAllBalances(),
      this.repo.countAllAccounts(),
      this.repo.countTransactionsByType('deposit'),
      this.repo.countTransactionsByType('withdrawal'),
    ]);

    return {
      totalBalance,
      totalAccounts,
      depositsCount,
      withdrawalsCount,
    };
  }
}
