import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/config'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/auctions`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/rules`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contacts`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/login`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/register`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  let lotRoutes: MetadataRoute.Sitemap = []
  try {
    const lots = await prisma.lot.findMany({
      where: { status: { in: ['ACTIVE', 'ENDED', 'SOLD'] } },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    })
    lotRoutes = lots.map((lot) => ({
      url: `${base}/auctions/${lot.id}`,
      lastModified: lot.updatedAt,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    }))
  } catch {
    // База может быть недоступна на этапе сборки — отдаём только статику.
  }

  return [...staticRoutes, ...lotRoutes]
}
