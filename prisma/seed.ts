import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aieraa.com' },
    update: {},
    create: {
      email: 'admin@aieraa.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '+91 98765 43210',
      role: 'ADMIN',
      status: 'APPROVED',
    },
  });

  // Create Universities
  const university1 = await prisma.university.upsert({
    where: { name: 'IIT Delhi' },
    update: {},
    create: {
      code: 'IITD',
      name: 'IIT Delhi',
      location: 'New Delhi',
      description: 'Indian Institute of Technology Delhi',
      isActive: true,
    },
  });

  const university2 = await prisma.university.upsert({
    where: { name: 'IIT Bombay' },
    update: {},
    create: {
      code: 'IITB',
      name: 'IIT Bombay',
      location: 'Mumbai',
      description: 'Indian Institute of Technology Bombay',
      isActive: true,
    },
  });

  // Create Manager User
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@iitdelhi.ac.in' },
    update: {},
    create: {
      email: 'manager@iitdelhi.ac.in',
      password: managerPassword,
      name: 'IIT Delhi Manager',
      phone: '+91 98765 43211',
      role: 'MANAGER',
      status: 'APPROVED',
      universityId: university1.id,
    },
  });

  // Assign Manager to University
  await prisma.universityManager.upsert({
    where: {
      universityId_managerId: {
        universityId: university1.id,
        managerId: manager.id,
      },
    },
    update: {},
    create: {
      universityId: university1.id,
      managerId: manager.id,
    },
  });

  // Create Sample Menu
  const menu = await prisma.menu.create({
    data: {
      name: 'Breakfast Menu',
      description: 'Daily breakfast offerings',
      universityId: university1.id,
      items: {
        create: [
          {
            name: 'Idli Sambar',
            slug: 'idli-sambar',
            description: 'Steamed rice cakes with lentil curry',
            category: 'South Indian',
            isAvailable: true,
            variants: {
              create: [
                { name: '2 pieces', price: 30, isDefault: true },
                { name: '4 pieces', price: 50, isDefault: false },
              ],
            },
          },
          {
            name: 'Aloo Paratha',
            slug: 'aloo-paratha',
            description: 'Stuffed potato flatbread',
            category: 'North Indian',
            isAvailable: true,
            variants: {
              create: [
                { name: '1 piece', price: 40, isDefault: true },
                { name: '2 pieces', price: 70, isDefault: false },
              ],
            },
          },
          {
            name: 'Tea',
            slug: 'tea',
            description: 'Indian masala tea',
            category: 'Beverages',
            isAvailable: true,
            variants: {
              create: [
                { name: 'Regular', price: 10, isDefault: true },
                { name: 'Large', price: 15, isDefault: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin: admin@aieraa.com / admin123');
  console.log('📧 Manager: manager@iitdelhi.ac.in / manager123');
  console.log(`🏛️  Universities: ${university1.name}, ${university2.name}`);
  console.log(`🍽️  Sample menu created with ${3} items`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
