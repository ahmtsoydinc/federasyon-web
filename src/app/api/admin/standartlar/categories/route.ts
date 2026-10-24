import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET() {
  const categories = await prisma.standardCategory.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { standards: true } } },
  })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { slug, label, fullTitle, color, order } = await req.json()
  if (!slug || !label || !fullTitle) return NextResponse.json({ error: 'slug, label, fullTitle zorunlu' }, { status: 400 })

  const cat = await prisma.standardCategory.create({
    data: { slug, label, fullTitle, color: color || '#059669', order: order ?? 0 },
  })
  return NextResponse.json(cat, { status: 201 })
}
