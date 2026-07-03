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

// Платёжные ссылки ЕРИП и криптокошельки для админки.
export async function getPaymentMethods() {
  const [links, wallets] = await Promise.all([
    prisma.paymentLink.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.cryptoWallet.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])
  return { links, wallets }
}

// Заявки на пополнение (по статусу).
export async function getDeposits(status?: 'PENDING' | 'CONFIRMED' | 'REJECTED') {
  return prisma.depositRequest.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
      paymentLink: { select: { label: true } },
      wallet: { select: { asset: true, network: true, address: true } },
    },
  })
}

export async function getPendingDepositCount() {
  return prisma.depositRequest.count({ where: { status: 'PENDING' } })
}

// Анкеты KYC на модерацию и историю.
export async function getKycProfiles(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
  return prisma.user.findMany({
    where: status ? { kycStatus: status } : { kycStatus: { not: 'NONE' } },
    orderBy: { kycSubmittedAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
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
      kycSubmittedAt: true,
      kycRejectReason: true,
    },
  })
}

export async function getPendingKycCount() {
  return prisma.user.count({ where: { kycStatus: 'PENDING' } })
}

// Расширенный список пользователей с балансами.
export async function getAdminUsersFull() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      kycStatus: true,
      balanceByn: true,
      balanceUsd: true,
      heldByn: true,
      heldUsd: true,
      createdAt: true,
      _count: { select: { bids: true, wonLots: true } },
    },
  })
}
