import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { hashPassword } from '../src/common/utils/hash.util';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ;
  const rawPassword = process.env.ADMIN_PASSWORD ;
  const firstName = process.env.ADMIN_FIRST_NAME ;
  const lastName = process.env.ADMIN_LAST_NAME ;
  const phoneNumber = process.env.ADMIN_PHONE ;

  const password = await hashPassword(rawPassword || 'Admin@12345');

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        role: 'admin',
        status: 'active',
        firstName,
        lastName,
        phoneNumber,
        ...(process.env.ADMIN_ROTATE_PASSWORD === 'true' ? { password } : {}),
      },
    });
    console.log(`[seed] Admin user updated: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role: 'admin',
        status: 'active',
      },
    });
    console.log(`[seed] Admin user created: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

