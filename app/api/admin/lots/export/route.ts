import { getCurrentUser } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// Экранирование значения для CSV (RFC 4180).
function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value)
  if (/[",\n;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 })
  }

  const lots = await prisma.lot.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      winner: { select: { name: true, email: true } },
      _count: { select: { bids: true } },
    },
  })

  const headers = [
    'ID',
    'Название',
    'Марка',
    'Модель',
    'Год',
    'Пробег',
    'Статус',
    'Стартовая цена',
    'Текущая цена',
    'Шаг',
    'Купить сразу',
    'Ставок',
    'Начало',
    'Окончание',
    'Победитель',
    'Email победителя',
    'VIN',
    'Регион',
    'Создан',
  ]

  const rows = lots.map((lot) =>
    [
      lot.id,
      lot.title,
      lot.make,
      lot.model,
      lot.year,
      lot.mileage,
      lot.status,
      lot.startPrice,
      lot.currentPrice,
      lot.bidStep,
      lot.buyNowPrice ?? '',
      lot._count.bids,
      lot.startsAt.toISOString(),
      lot.endsAt.toISOString(),
      lot.winner?.name ?? '',
      lot.winner?.email ?? '',
      lot.vin ?? '',
      lot.location ?? '',
      lot.createdAt.toISOString(),
    ]
      .map(csvCell)
      .join(','),
  )

  // BOM для корректного отображения кириллицы в Excel.
  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
  const filename = `ignis-lots-${new Date().toISOString().slice(0, 10)}.csv`

  logger.info('admin.export.csv', { count: lots.length, by: user.id })

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
