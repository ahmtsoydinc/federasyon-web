import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPresidentFromRequest } from '@/lib/memberAuth'

export async function GET(req: NextRequest) {
  const president = getPresidentFromRequest(req)
  if (!president) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const members = await prisma.member.findMany({
    where: { associationId: president.associationId },
    select: { id: true, name: true, email: true, phone: true, approved: true, active: true, createdAt: true },
    orderBy: [{ approved: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(members)
}
