import prisma from '../../config/database';

export interface UsersRepository {
  findById(id: string): Promise<any | null>;
  findDetailedById(id: string): Promise<any | null>;
  list(where: any, skip: number, take: number, orderBy: any): Promise<any[]>;
  count(where: any): Promise<number>;
  findByPhone(phoneNumber: string): Promise<any | null>;
  updateById(id: string, data: any): Promise<any>;
  softDeleteById(id: string): Promise<void>;
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
}
