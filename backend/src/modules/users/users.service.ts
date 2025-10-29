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
    const [items, total] = await Promise.all([
      this.repo.list(where, skip, limit, orderBy),
      this.repo.count(where),
    ]);

    return { data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getUserDetails(id: string) {
    const user = await this.repo.findDetailedById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
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
