import { prisma } from '@/lib/prisma'

const cardSelect = {
  id: true,
  title: true,
  year: true,
  mileage: true,
  location: true,
  images: true,
  currentPrice: true,
  status: true,
  endsAt: true,
  _count: { select: { bids: true } },
} as const

export async function getFeaturedLots(limit = 6) {
  return prisma.lot.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { endsAt: 'asc' },
    take: limit,
    select: cardSelect,
  })
}

export type LotFilter = {
  q?: string
  status?: 'ACTIVE' | 'ENDED' | 'SOLD' | 'ALL'
  sort?: 'ending' | 'price_asc' | 'price_desc' | 'new'
}

export async function getPublicLots(filter: LotFilter = {}) {
  const { q, status = 'ACTIVE', sort = 'ending' } = filter

  const orderBy =
    sort === 'price_asc'
      ? { currentPrice: 'asc' as const }
      : sort === 'price_desc'
        ? { currentPrice: 'desc' as const }
        : sort === 'new'
          ? { createdAt: 'desc' as const }
          : { endsAt: 'asc' as const }

  return prisma.lot.findMany({
    where: {
      status:
        status === 'ALL'
          ? { in: ['ACTIVE', 'ENDED', 'SOLD'] }
          : status,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { make: { contains: q, mode: 'insensitive' } },
              { model: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy,
    select: cardSelect,
  })
}

export async function getLotDetail(id: string) {
  return prisma.lot.findUnique({
    where: { id },
    include: {
      winner: { select: { id: true, name: true } },
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: { user: { select: { name: true } } },
      },
      _count: { select: { bids: true } },
    },
  })
}

export async function getPublicStats() {
  const [activeLots, totalLots, usersCount] = await Promise.all([
    prisma.lot.count({ where: { status: 'ACTIVE' } }),
    prisma.lot.count({ where: { status: { in: ['ACTIVE', 'ENDED', 'SOLD'] } } }),
    prisma.user.count(),
  ])
  return { activeLots, totalLots, usersCount }
}
