import 'dotenv/config'
import { closeExpiredLots } from '../lib/lots-lifecycle'
import { prisma } from '../lib/prisma'

// Запуск по расписанию (cron) на VPS:
//   * * * * * cd /path/to/app && pnpm exec tsx scripts/close-lots.ts >> /var/log/ignis-cron.log 2>&1
async function main() {
  const closed = await closeExpiredLots()
  console.log(`[${new Date().toISOString()}] Закрыто лотов: ${closed}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
