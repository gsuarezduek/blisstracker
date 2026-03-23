const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@blissmkt.ar' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@blissmkt.ar',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create default "Bliss" project
  const bliss = await prisma.project.upsert({
    where: { name: 'Bliss' },
    update: {},
    create: { name: 'Bliss' },
  })

  console.log('Seed completed:')
  console.log('  Admin:', admin.email, '/ password: admin123')
  console.log('  Project:', bliss.name)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
