import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Her istekte veritabanindan taze veri okunur (onbellek yok)
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Etiketlerin gorunme suresi (gun)
const BADGE_DAYS = 30
// 24.10.2026 toplu aktarim kayitlari etiket almaz
const IMPORT_CUTOFF = new Date('2026-10-25T00:00:00Z').getTime()
// Bu kategoriler harf sirasina gore degil, paneldeki siraya gore listelenir
const MANUAL_ORDER_SLUGS = ['terminoloji']

function badgeFor(createdAt: Date, updatedAt: Date): string | null {
  const now = Date.now()
  const limit = BADGE_DAYS * 24 * 60 * 60 * 1000
  const c = new Date(createdAt).getTime()
  const u = new Date(updatedAt).getTime()
  if (c > IMPORT_CUTOFF && now - c < limit) return 'YENİ'
  if (u > IMPORT_CUTOFF && u - c > 60 * 1000 && now - u < limit) return 'GÜNCELLENDİ'
  return null
}

export async function GET() {
  const categories = await prisma.standardCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      standards: {
        orderBy: { order: 'asc' },
        include: {
          images: { orderBy: { order: 'asc' } },
        },
      },
    },
  })

  const result = categories.map((cat) => {
    const standards = cat.standards.map((s) => ({
      ...s,
      badge: badgeFor(s.createdAt, s.updatedAt),
    }))
    if (!MANUAL_ORDER_SLUGS.includes(cat.slug)) {
      standards.sort((a, b) => a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' }))
    }
    return { ...cat, standards }
  })

  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
}
