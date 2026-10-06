const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password123!';

const demoUsers = [
  { name: 'Ana García', email: 'ana@demo.com' },
  { name: 'Bruno López', email: 'bruno@demo.com' },
  { name: 'Carla Ruiz', email: 'carla@demo.com' },
];

async function main() {
  console.log('Seeding database...');
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, password: hashed },
      create: { name: u.name, email: u.email, password: hashed },
    });
    console.log(`  ✓ ${u.email}`);
  }

  const count = await prisma.user.count();
  console.log(`Seed complete. Total users: ${count}`);
  console.log(`Demo password for all: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
