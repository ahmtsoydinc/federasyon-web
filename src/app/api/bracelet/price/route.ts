import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET() {
  const price = await prisma.braceletPrice.findFirst({ orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ price: price?.pricePerUnit ?? 0 })
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { price } = await req.json()
  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    return NextResponse.json({ error: 'Geçerli bir fiyat girin' }, { status: 400 })
  }

  const record = await prisma.braceletPrice.upsert({
    where: { id: 1 },
    update: { pricePerUnit: Number(price), updatedById: user!.id },
    create: { id: 1, pricePerUnit: Number(price), updatedById: user!.id },
  })

  return NextResponse.json(record)
}
