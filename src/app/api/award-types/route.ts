import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'

  const awards = await prisma.awardType.findMany({
    where: all ? {} : { active: true },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  })
  return NextResponse.json(awards)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!user || !['superadmin', 'moderator'].includes(user.role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { name, order } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Ödül adı zorunlu' }, { status: 400 })

  const award = await prisma.awardType.create({
    data: { name: name.trim(), order: order ?? 0, active: true },
  })
  return NextResponse.json(award, { status: 201 })
}
