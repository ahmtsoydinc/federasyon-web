import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

interface ImportRow {
  name: string
  city?: string
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const body = await req.json()
  const rows: ImportRow[] = body.rows

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'Geçerli satır bulunamadı' }, { status: 400 })
  }

  // Mevcut dernek adlarını çek (büyük/küçük harf duyarsız karşılaştırma için)
  const existing = await prisma.association.findMany({ select: { name: true } })
  const existingNames = new Set(existing.map(e => e.name.trim().toLowerCase()))

  const toInsert: ImportRow[] = []
  const skipped: string[] = []

  for (const row of rows) {
    const name = row.name?.trim()
    if (!name) continue
    if (existingNames.has(name.toLowerCase())) {
      skipped.push(name)
    } else {
      toInsert.push({ name, city: row.city?.trim() || undefined })
      existingNames.add(name.toLowerCase()) // tekrar eklenmesin
    }
  }

  let added = 0
  if (toInsert.length > 0) {
    const result = await prisma.association.createMany({
      data: toInsert.map(r => ({ name: r.name, city: r.city || null })),
    })
    added = result.count
  }

  return NextResponse.json({ added, skipped: skipped.length, skippedNames: skipped })
}
