import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('usermaster#@', 10);

  await prisma.user.upsert({
    where: { email: 'master@motorplus.com' },
    update: {
      accessType: 'MASTER',
      isMasterSeed: true,
      status: 'Ativo',
    },
    create: {
      email: 'master@motorplus.com',
      password: passwordHash,
      accessType: 'MASTER',
      isMasterSeed: true,
      status: 'Ativo',
    },
  });

  console.log('Seed RF13: master@motorplus.com criado/atualizado');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
