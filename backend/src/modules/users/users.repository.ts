import prisma from '../../config/database';

export interface UsersRepository {
  findById(id: string): Promise<any | null>;
  findDetailedById(id: string): Promise<any | null>;
  list(where: any, skip: number, take: number, orderBy: any): Promise<any[]>;
  count(where: any): Promise<number>;
  findByPhone(phoneNumber: string): Promise<any | null>;
  updateById(id: string, data: any): Promise<any>;
  softDeleteById(id: string): Promise<void>;
  findRecentLogins(userId: string, limit: number): Promise<any[]>;
  countActiveSessions(userId: string): Promise<number>;
  findLastLogin(userId: string): Promise<Date | null>;
  countCreditByStatus(userId: string): Promise<{ pending: number; approved: number; rejected: number; disbursed: number; repaid: number }>;
}

export class PrismaUsersRepository implements UsersRepository {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  findDetailedById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        savingsAccount: true,
        creditRequests: { include: { repayments: true } },
      },
    });
  }

  list(where: any, skip: number, take: number, orderBy: any) {
    return prisma.user.findMany({ where, skip, take, orderBy });
  }

  count(where: any) {
    return prisma.user.count({ where });
  }

  findByPhone(phoneNumber: string) {
    return prisma.user.findUnique({ where: { phoneNumber } });
  }

  updateById(id: string, data: any) {
    return prisma.user.update({ where: { id }, data });
  }

  async softDeleteById(id: string) {
    await prisma.user.update({ where: { id }, data: { status: 'deleted' } });
  }

  findRecentLogins(userId: string, limit: number) {
    return prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { token: true, deviceInfo: true, ipAddress: true, createdAt: true, revokedAt: true, expiresAt: true }
    });
  }

  countActiveSessions(userId: string) {
    return prisma.refreshToken.count({ where: { userId, revokedAt: null, expiresAt: { gt: new Date() } } });
  }

  async findLastLogin(userId: string) {
    const last = await prisma.refreshToken.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } });
    return last ? last.createdAt : null;
  }

  async countCreditByStatus(userId: string) {
    const [pending, approved, rejected, disbursed, repaid] = await Promise.all([
      prisma.creditRequest.count({ where: { userId, status: 'pending' } }),
      prisma.creditRequest.count({ where: { userId, status: 'approved' } }),
      prisma.creditRequest.count({ where: { userId, status: 'rejected' } }),
      prisma.creditRequest.count({ where: { userId, status: 'disbursed' } }),
      prisma.creditRequest.count({ where: { userId, status: 'repaid' } }),
    ]);
    return { pending, approved, rejected, disbursed, repaid };
  }
}
