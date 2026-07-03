import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@ignis.by'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin12345'

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', emailVerified: new Date() },
    create: {
      email: adminEmail,
      name: 'Администратор',
      role: 'ADMIN',
      emailVerified: new Date(),
      passwordHash: await bcrypt.hash(adminPassword, 12),
    },
  })
  console.log(`Администратор готов: ${admin.email}`)

  const lotCount = await prisma.lot.count()
  if (lotCount === 0) {
    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + 7)

    await prisma.lot.create({
      data: {
        title: 'BMW M5 Competition, 2021',
        make: 'BMW',
        model: 'M5 Competition',
        year: 2021,
        mileage: 42000,
        engineVol: 4.4,
        power: 625,
        transmission: 'Автомат',
        bodyType: 'Седан',
        fuelType: 'Бензин',
        drive: 'Полный',
        color: 'Тёмно-синий',
        vin: 'WBSJF0C0X0XXXXXXX',
        location: 'Минск',
        condition: 'Отличное, без ДТП',
        description:
          'Демонстрационный лот. Полный пакет M Competition, сервисная история, один владелец. Замените или удалите его в админ-панели и добавьте свои автомобили.',
        images: ['/cars/bmw-m5.png'],
        startPrice: 145000,
        bidStep: 500,
        currentPrice: 145000,
        buyNowPrice: 185000,
        status: 'ACTIVE',
        endsAt,
      },
    })
    console.log('Создан демо-лот BMW M5 Competition')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
