import { verifyPassword, hashPassword } from '../../common/utils/hash.util';
import { UnauthorizedError } from '../../common/exceptions/UnauthorizedError';
import { NotFoundError } from '../../common/exceptions/NotFoundError';
import { ConflictError } from '../../common/exceptions/ConflictError';
import { UpdateProfileDto, ChangePasswordDto, UserProfile } from './users.types';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaUsersRepository, UsersRepository } from './users.repository';

export class UsersService {
  constructor(private readonly repo: UsersRepository = new PrismaUsersRepository()) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserProfile> {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.phoneNumber && data.phoneNumber !== user.phoneNumber) {
      const existingUser = await this.repo.findByPhone(data.phoneNumber);

      if (existingUser) {
        throw new ConflictError('Phone number is already in use');
      }
    }

    const updatedUser = await this.repo.updateById(userId, {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.phoneNumber && { phoneNumber: data.phoneNumber })
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };
  }

  async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isCurrentPasswordValid = await verifyPassword(data.currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedNewPassword = await hashPassword(data.newPassword);

    await this.repo.updateById(userId, { password: hashedNewPassword });

    try {
      const notifications = new NotificationsService();
      await notifications.notify({
        userId,
        type: 'in_app',
        title: 'Password changed',
        message: 'Your account password was changed successfully.'
      });
    } catch (_) {}
  }

  async listUsers(params: { page: number; limit: number; role?: string; status?: string; email?: string; sortBy?: string; order?: 'asc' | 'desc'; }) {
    const { page, limit, role, status, email, sortBy = 'createdAt', order = 'desc' } = params;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (email) where.email = { contains: email, mode: 'insensitive' };

    const orderBy: any = { [sortBy]: order };
    const [users, total] = await Promise.all([
      this.repo.list(where, skip, limit, orderBy),
      this.repo.count(where),
    ]);

    const enriched = await Promise.all(users.map(async (u: any) => {
      const [lastLoginAt, sessionsActive] = await Promise.all([
        this.repo.findLastLogin(u.id),
        this.repo.countActiveSessions(u.id)
      ]);
      return {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phoneNumber: u.phoneNumber,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        lastLoginAt,
        sessionsActive
      };
    }));

    return { data: enriched, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getUserDetails(id: string) {
    const user = await this.repo.findDetailedById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const [recentLogins, sessionsActive, creditCounts] = await Promise.all([
      this.repo.findRecentLogins(id, 10),
      this.repo.countActiveSessions(id),
      this.repo.countCreditByStatus(id)
    ]);

    const devicesMap: Record<string, { deviceInfo: string | null; lastSeenAt: Date; ipAddress: string | null }> = {};
    for (const rt of recentLogins) {
      const key = rt.deviceInfo || 'unknown';
      if (!devicesMap[key] || devicesMap[key].lastSeenAt < rt.createdAt) {
        devicesMap[key] = { deviceInfo: rt.deviceInfo, lastSeenAt: rt.createdAt, ipAddress: rt.ipAddress };
      }
    }
    const devices = Object.values(devicesMap);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      savingsAccount: user.savingsAccount ? {
        id: user.savingsAccount.id,
        balance: Number(user.savingsAccount.balance),
        currency: user.savingsAccount.currency,
        status: user.savingsAccount.status,
        createdAt: user.savingsAccount.createdAt
      } : null,
      credit: {
        counts: creditCounts,
        requests: user.creditRequests.map((r: any) => ({
          id: r.id,
          amount: Number(r.amount),
          status: r.status,
          purpose: r.purpose,
          durationMonths: r.durationMonths,
          interestRate: Number(r.interestRate),
          createdAt: r.createdAt,
          repayments: r.repayments.map((p: any) => ({ id: p.id, amount: Number(p.amount), paymentDate: p.paymentDate }))
        }))
      },
      activity: {
        sessionsActive,
        recentLogins: recentLogins.map(rt => ({ createdAt: rt.createdAt, deviceInfo: rt.deviceInfo, ipAddress: rt.ipAddress, revokedAt: rt.revokedAt, expiresAt: rt.expiresAt })),
        devices
      }
    };
  }

  async updateUserStatus(id: string, status: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const updated = await this.repo.updateById(id, { status });
    return updated;
  }

  async softDeleteUser(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    await this.repo.softDeleteById(id);
  }
}
