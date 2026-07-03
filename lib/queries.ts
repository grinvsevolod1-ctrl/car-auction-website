import { prisma } from '@/lib/prisma'
import { lazyCloseExpiredLots } from '@/lib/lots-lifecycle'
import { CATALOG_PAGE_SIZE } from '@/lib/config'

const cardSelect = {
  id: true,
  title: true,
  year: true,
  mileage: true,
  location: true,
  images: true,
  currentPrice: true,
  currency: true,
  originCountry: true,
  region: true,
  status: true,
  endsAt: true,
  _count: { select: { bids: true } },
} as const

export async function getFeaturedLots(limit = 6) {
  await lazyCloseExpiredLots()
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
  page?: number
}

export async function getPublicLots(filter: LotFilter = {}) {
  await lazyCloseExpiredLots()
  const { q, status = 'ACTIVE', sort = 'ending' } = filter
  const pageSize = CATALOG_PAGE_SIZE
  const page = Math.max(1, Math.floor(filter.page ?? 1))

  const orderBy =
    sort === 'price_asc'
      ? { currentPrice: 'asc' as const }
      : sort === 'price_desc'
        ? { currentPrice: 'desc' as const }
        : sort === 'new'
          ? { createdAt: 'desc' as const }
          : { endsAt: 'asc' as const }

  const where = {
    status:
      status === 'ALL'
        ? { in: ['ACTIVE', 'ENDED', 'SOLD'] as ('ACTIVE' | 'ENDED' | 'SOLD')[] }
        : status,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { make: { contains: q, mode: 'insensitive' as const } },
            { model: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [lots, total] = await Promise.all([
    prisma.lot.findMany({
      where,
      orderBy,
      select: cardSelect,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lot.count({ where }),
  ])

  return {
    lots,
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getLotDetail(id: string) {
  await lazyCloseExpiredLots()
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

// Лёгкий запрос для live-обновления цены и истории ставок (polling).
export async function getLotLive(id: string) {
  const lot = await prisma.lot.findUnique({
    where: { id },
    select: {
      id: true,
      currentPrice: true,
      bidStep: true,
      status: true,
      endsAt: true,
      winnerId: true,
      _count: { select: { bids: true } },
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          amount: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  })
  return lot
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

export async function getUserNotifications(userId: string, limit = 8) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getUserWatchlist(userId: string) {
  await lazyCloseExpiredLots()
  const rows = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { lot: { select: cardSelect } },
  })
  return rows.map((r) => r.lot)
}

// Статус избранного/автоставки текущего пользователя для конкретного лота.
export async function getLotUserState(userId: string, lotId: string) {
  const [watch, autoBid] = await Promise.all([
    prisma.watchlist.findUnique({
      where: { userId_lotId: { userId, lotId } },
      select: { id: true },
    }),
    prisma.autoBid.findUnique({
      where: { userId_lotId: { userId, lotId } },
      select: { maxAmount: true, active: true },
    }),
  ])
  return {
    watching: Boolean(watch),
    autoBidMax: autoBid?.active ? autoBid.maxAmount : null,
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

// Баланс, последние транзакции и заявки на пополнение пользователя.
export async function getUserBalance(userId: string) {
  const [user, transactions, deposits] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        balanceByn: true,
        balanceUsd: true,
        heldByn: true,
        heldUsd: true,
      },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.depositRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        paymentLink: { select: { label: true, url: true } },
        wallet: { select: { asset: true, network: true, address: true } },
      },
    }),
  ])
  return {
    balance: user ?? { balanceByn: 0, balanceUsd: 0, heldByn: 0, heldUsd: 0 },
    transactions,
    deposits,
  }
}

// Данные KYC-анкеты пользователя.
export async function getUserKyc(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      middleName: true,
      birthDate: true,
      passportNumber: true,
      country: true,
      city: true,
      address: true,
      phone: true,
      occupation: true,
      sourceOfFunds: true,
      kycStatus: true,
      kycRejectReason: true,
      kycSubmittedAt: true,
    },
  })
}
