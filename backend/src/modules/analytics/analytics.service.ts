import prisma from '../../config/database';

export class AnalyticsService {
  async getOverview() {
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalCredits,
      pendingCredits,
      approvedCredits,
      rejectedCredits,
      repaidCredits,
      savingsAgg,
      activeSessions,
      loginsLast24h
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.creditRequest.count(),
      prisma.creditRequest.count({ where: { status: 'pending' } }),
      prisma.creditRequest.count({ where: { status: 'approved' } }),
      prisma.creditRequest.count({ where: { status: 'rejected' } }),
      prisma.creditRequest.count({ where: { status: 'repaid' } }),
      prisma.savingsAccount.aggregate({ _sum: { balance: true } }),
      prisma.refreshToken.count({ where: { revokedAt: null, expiresAt: { gt: now } } }),
      prisma.refreshToken.count({ where: { createdAt: { gt: since } } })
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      credits: {
        total: totalCredits,
        byStatus: {
          pending: pendingCredits,
          approved: approvedCredits,
          rejected: rejectedCredits,
          repaid: repaidCredits
        }
      },
      savings: { totalBalance: Number(savingsAgg._sum.balance ?? 0) },
      sessions: { active: activeSessions },
      logins: { last24h: loginsLast24h }
    };
  }
}


