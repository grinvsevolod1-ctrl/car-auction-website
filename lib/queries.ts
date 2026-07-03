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

export async function getUserDashboard(userId: string) {
  // Latest bid per lot the user participated in
  const bids = await prisma.bid.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      lot: {
        select: {
          id: true,
          title: true,
          images: true,
          currentPrice: true,
          status: true,
          endsAt: true,
          winnerId: true,
        },
      },
    },
  })

  // Reduce to one row per lot (the user's highest bid on that lot)
  const byLot = new Map<
    string,
    { lot: (typeof bids)[number]['lot']; myMax: number; isLeading: boolean; isWon: boolean }
  >()
  for (const b of bids) {
    const cur = byLot.get(b.lotId)
    const myMax = Math.max(cur?.myMax ?? 0, b.amount)
    byLot.set(b.lotId, {
      lot: b.lot,
      myMax,
      isLeading: myMax >= b.lot.currentPrice && b.lot.status === 'ACTIVE',
      isWon: b.lot.winnerId === userId,
    })
  }

  const rows = Array.from(byLot.values())
  return {
    rows,
    stats: {
      participating: rows.filter((r) => r.lot.status === 'ACTIVE').length,
      leading: rows.filter((r) => r.isLeading).length,
      won: rows.filter((r) => r.isWon).length,
    },
  }
}

export async function getPublicStats() {
  const [activeLots, totalLots, usersCount] = await Promise.all([
    prisma.lot.count({ where: { status: 'ACTIVE' } }),
    prisma.lot.count({ where: { status: { in: ['ACTIVE', 'ENDED', 'SOLD'] } } }),
    prisma.user.count(),
  ])
  return { activeLots, totalLots, usersCount }
}
