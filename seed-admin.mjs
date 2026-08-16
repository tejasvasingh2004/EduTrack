import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Let's just find the first user in the database and make them an ADMIN
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.log("No users found! Please register an account first.");
    return;
  }
  
  const admin = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' }
  });
  
  console.log(`✅ Promoted user to ADMIN!`);
  console.log(`Email to login with: ${admin.email}`);
  console.log(`Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
