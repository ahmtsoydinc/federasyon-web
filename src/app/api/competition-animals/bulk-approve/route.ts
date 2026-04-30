import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPresidentFromRequest } from '@/lib/memberAuth'

export async function POST(req: NextRequest) {
  const president = getPresidentFromRequest(req)
  if (!president) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { ids } = await req.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids dizisi zorunlu' }, { status: 400 })
  }

  // Sadece bu başkanın derneğine ait ve submitted olan hayvanları onayla
  const result = await prisma.competitionAnimal.updateMany({
    where: {
      id: { in: ids.map(Number) },
      status: 'submitted',
      member: { associationId: president.associationId },
    },
    data: {
      status: 'assoc_approved',
      presidentApprovedAt: new Date(),
    },
  })

  return NextResponse.json({ approved: result.count })
}
