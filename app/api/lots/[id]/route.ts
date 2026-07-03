import { NextResponse } from 'next/server'
import { getLotLive } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const lot = await getLotLive(id)
  if (!lot) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const now = Date.now()
  const isActive = lot.status === 'ACTIVE' && lot.endsAt.getTime() > now

  return NextResponse.json(
    {
      currentPrice: lot.currentPrice,
      bidStep: lot.bidStep,
      status: lot.status,
      isActive,
      endsAt: lot.endsAt.toISOString(),
      bidCount: lot._count.bids,
      bids: lot.bids.map((b) => ({
        id: b.id,
        amount: b.amount,
        name: b.user.name,
        createdAt: b.createdAt.toISOString(),
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
