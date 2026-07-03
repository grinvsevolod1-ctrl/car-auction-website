import { prisma } from '@/lib/prisma'

export async function getAdminStats() {
  const [active, draft, ended, sold, users, bids, revenue] = await Promise.all([
    prisma.lot.count({ where: { status: 'ACTIVE' } }),
    prisma.lot.count({ where: { status: 'DRAFT' } }),
    prisma.lot.count({ where: { status: 'ENDED' } }),
    prisma.lot.count({ where: { status: 'SOLD' } }),
    prisma.user.count(),
    prisma.bid.count(),
    prisma.lot.aggregate({
      where: { status: 'SOLD' },
      _sum: { currentPrice: true },
    }),
  ])
  return {
    active,
    draft,
    ended,
    sold,
    users,
    bids,
    revenue: revenue._sum.currentPrice ?? 0,
  }
}

export async function getAdminLots() {
  return prisma.lot.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      currentPrice: true,
      startPrice: true,
      endsAt: true,
      images: true,
      _count: { select: { bids: true } },
    },
  })
}

export async function getAdminLot(id: string) {
  return prisma.lot.findUnique({ where: { id } })
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { bids: true, wonLots: true } },
    },
  })
}

export async function getRecentBids(limit = 8) {
  return prisma.bid.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: { select: { name: true } },
      lot: { select: { id: true, title: true } },
    },
  })
}
