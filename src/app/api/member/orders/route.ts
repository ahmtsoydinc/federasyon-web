import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMemberFromRequest } from '@/lib/memberAuth'

// Sadece üye token'ına bakar — admin cookie'si varsa bile yok sayar
export async function GET(req: NextRequest) {
  const member = getMemberFromRequest(req)
  if (!member) return NextResponse.json({ error: 'Üye girişi gerekli' }, { status: 401 })

  const orders = await prisma.braceletOrder.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: 'desc' },
    include: { association: { select: { name: true } } },
  })

  return NextResponse.json(orders)
}
