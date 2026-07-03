import 'server-only'
import { prisma } from './prisma'
import type { Currency } from './money'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
type DB = Tx | typeof prisma

// Баланс хранится в двух валютах. Доступно = баланс − заморожено (held).
type BalanceFields = {
  balanceByn: number
  balanceUsd: number
  heldByn: number
  heldUsd: number
}

export function availableOf(u: BalanceFields, currency: Currency): number {
  return currency === 'USD'
    ? u.balanceUsd - u.heldUsd
    : u.balanceByn - u.heldByn
}

export async function getAvailable(
  userId: string,
  currency: Currency,
): Promise<number> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { balanceByn: true, balanceUsd: true, heldByn: true, heldUsd: true },
  })
  if (!u) return 0
  return availableOf(u, currency)
}

// Поля для инкремента баланса/заморозки по валюте.
function balField(currency: Currency) {
  return currency === 'USD' ? 'balanceUsd' : 'balanceByn'
}
function heldField(currency: Currency) {
  return currency === 'USD' ? 'heldUsd' : 'heldByn'
}

async function writeTx(
  db: DB,
  args: {
    userId: string
    type: 'DEPOSIT' | 'HOLD' | 'RELEASE' | 'PURCHASE' | 'REFUND' | 'ADJUST'
    currency: Currency
    amount: number
    balanceAfter: number
    note?: string
    lotId?: string
    depositId?: string
  },
) {
  await db.transaction.create({
    data: {
      userId: args.userId,
      type: args.type,
      currency: args.currency,
      amount: args.amount,
      balanceAfter: args.balanceAfter,
      note: args.note ?? null,
      lotId: args.lotId ?? null,
      depositId: args.depositId ?? null,
    },
  })
}

// Зачисление пополнения на баланс (после подтверждения заявки).
export async function creditDeposit(
  db: DB,
  userId: string,
  currency: Currency,
  amount: number,
  opts: { depositId?: string; note?: string; type?: 'DEPOSIT' | 'ADJUST' } = {},
): Promise<void> {
  if (amount === 0) return
  const updated = await db.user.update({
    where: { id: userId },
    data: { [balField(currency)]: { increment: amount } },
    select: { balanceByn: true, balanceUsd: true, heldByn: true, heldUsd: true },
  })
  await writeTx(db, {
    userId,
    type: opts.type ?? 'DEPOSIT',
    currency,
    amount,
    balanceAfter: availableOf(updated, currency),
    note: opts.note,
    depositId: opts.depositId,
  })
}

// Приводит заморозки лота к финальному состоянию торгов:
// у лидера заморожена его ставка, у всех остальных средства освобождены.
// Защитная реализация: никогда не бросает исключение и не уводит held в минус.
export async function reconcileHolds(
  tx: Tx,
  lotId: string,
  currency: Currency,
): Promise<void> {
  const top = await tx.bid.findFirst({
    where: { lotId },
    orderBy: [{ amount: 'desc' }, { createdAt: 'desc' }],
    select: { userId: true, amount: true },
  })
  const holds = await tx.lotHold.findMany({
    where: { lotId, active: true },
  })

  // Освобождаем заморозки всех, кроме текущего лидера.
  for (const h of holds) {
    if (top && h.userId === top.userId) continue
    await releaseHoldRow(tx, h.id)
  }

  if (!top) return

  // Устанавливаем заморозку лидера равной его ставке.
  const existing = await tx.lotHold.findUnique({
    where: { userId_lotId: { userId: top.userId, lotId } },
  })
  const currentHeld = existing?.active ? existing.amount : 0
  let target = top.amount

  const u = await tx.user.findUnique({
    where: { id: top.userId },
    select: { balanceByn: true, balanceUsd: true, heldByn: true, heldUsd: true },
  })
  if (!u) return
  const available = availableOf(u, currency)
  let delta = target - currentHeld
  // Не даём заморозить больше, чем доступно.
  if (delta > available) {
    delta = available
    target = currentHeld + delta
  }
  if (delta !== 0) {
    const updated = await tx.user.update({
      where: { id: top.userId },
      data: { [heldField(currency)]: { increment: delta } },
      select: {
        balanceByn: true,
        balanceUsd: true,
        heldByn: true,
        heldUsd: true,
      },
    })
    await writeTx(tx, {
      userId: top.userId,
      type: delta > 0 ? 'HOLD' : 'RELEASE',
      currency,
      amount: -delta, // held растёт => доступно падает (amount отрицательный)
      balanceAfter: availableOf(updated, currency),
      lotId,
      note: 'Заморозка под ставку',
    })
  }
  await tx.lotHold.upsert({
    where: { userId_lotId: { userId: top.userId, lotId } },
    update: { amount: target, active: true, currency },
    create: { userId: top.userId, lotId, amount: target, currency, active: true },
  })
}

async function releaseHoldRow(tx: Tx, holdId: string): Promise<void> {
  const h = await tx.lotHold.findUnique({ where: { id: holdId } })
  if (!h || !h.active || h.amount <= 0) {
    if (h?.active) await tx.lotHold.update({ where: { id: holdId }, data: { active: false } })
    return
  }
  const updated = await tx.user.update({
    where: { id: h.userId },
    data: { [heldField(h.currency)]: { decrement: h.amount } },
    select: { balanceByn: true, balanceUsd: true, heldByn: true, heldUsd: true },
  })
  await writeTx(tx, {
    userId: h.userId,
    type: 'RELEASE',
    currency: h.currency,
    amount: h.amount, // доступно растёт
    balanceAfter: availableOf(updated, h.currency),
    lotId: h.lotId,
    note: 'Разморозка средств',
  })
  await tx.lotHold.update({ where: { id: holdId }, data: { active: false } })
}

// Освобождает все заморозки лота (лот завершён без продажи / снят).
export async function releaseAllHolds(tx: Tx, lotId: string): Promise<void> {
  const holds = await tx.lotHold.findMany({ where: { lotId, active: true } })
  for (const h of holds) await releaseHoldRow(tx, h.id)
}

// Списывает средства победителя (заморозка -> покупка), освобождает остальных.
export async function captureWinner(
  tx: Tx,
  lotId: string,
  winnerId: string,
  amount: number,
  currency: Currency,
): Promise<void> {
  // Освобождаем всех, кроме победителя.
  const holds = await tx.lotHold.findMany({ where: { lotId, active: true } })
  for (const h of holds) {
    if (h.userId !== winnerId) await releaseHoldRow(tx, h.id)
  }

  const hold = await tx.lotHold.findUnique({
    where: { userId_lotId: { userId: winnerId, lotId } },
  })
  const held = hold?.active ? hold.amount : 0

  // Списываем со счёта: уменьшаем баланс и снимаем заморозку.
  const updated = await tx.user.update({
    where: { id: winnerId },
    data: {
      [balField(currency)]: { decrement: amount },
      [heldField(currency)]: { decrement: Math.min(held, amount) },
    },
    select: { balanceByn: true, balanceUsd: true, heldByn: true, heldUsd: true },
  })
  await writeTx(tx, {
    userId: winnerId,
    type: 'PURCHASE',
    currency,
    amount: -amount,
    balanceAfter: availableOf(updated, currency),
    lotId,
    note: 'Оплата выигранного лота',
  })
  if (hold?.active) {
    await tx.lotHold.update({
      where: { id: hold.id },
      data: { active: false },
    })
  }
}
