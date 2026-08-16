import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { email: 'applicant@example.com' },
    data: { role: 'ADMIN' }
  });
  console.log("Forced applicant@example.com to ADMIN!");
}

main().finally(() => prisma.$disconnect());
