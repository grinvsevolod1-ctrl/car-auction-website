import 'dotenv/config'
import { closeExpiredLots, notifyEndingSoon } from '../lib/lots-lifecycle'
import { prisma } from '../lib/prisma'

// Запуск по расписанию (cron) на VPS:
//   * * * * * cd /path/to/app && pnpm exec tsx scripts/close-lots.ts >> /var/log/ignis-cron.log 2>&1
async function main() {
  const closed = await closeExpiredLots()
  const notified = await notifyEndingSoon()
  console.log(
    `[${new Date().toISOString()}] Закрыто лотов: ${closed}; писем «скоро завершится»: ${notified}`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
