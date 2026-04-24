import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET() {
  const associations = await prisma.association.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    include: { _count: { select: { members: true } } },
  })
  return NextResponse.json(associations)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { name, city } = await req.json()
  if (!name) return NextResponse.json({ error: 'Dernek adı zorunlu' }, { status: 400 })

  const assoc = await prisma.association.create({ data: { name, city: city || null } })
  return NextResponse.json(assoc, { status: 201 })
}
