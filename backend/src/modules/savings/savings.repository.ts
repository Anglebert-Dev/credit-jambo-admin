import prisma from '../../config/database';

export interface SavingsRepository {
  sumAllBalances(): Promise<number>;
  countAllAccounts(): Promise<number>;
  countTransactionsByType(type: 'deposit' | 'withdrawal'): Promise<number>;
}

export class PrismaSavingsRepository implements SavingsRepository {
  async sumAllBalances() {
    const result = await prisma.savingsAccount.aggregate({ _sum: { balance: true } });
    return Number(result._sum.balance ?? 0);
  }

  countAllAccounts() {
    return prisma.savingsAccount.count();
  }

  countTransactionsByType(type: 'deposit' | 'withdrawal') {
    return prisma.transaction.count({ where: { type } });
  }
}
