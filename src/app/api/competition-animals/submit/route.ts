import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMemberFromRequest } from '@/lib/memberAuth'

// Üyenin pending hayvanlarını "submitted" statüsüne alır
export async function POST(req: NextRequest) {
  const member = getMemberFromRequest(req)
  if (!member) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { competitionId } = await req.json()
  if (!competitionId) return NextResponse.json({ error: 'competitionId gerekli' }, { status: 400 })

  const result = await prisma.competitionAnimal.updateMany({
    where: {
      memberId: member.id,
      competitionId: parseInt(competitionId),
      status: 'pending',
    },
    data: { status: 'submitted' },
  })

  return NextResponse.json({ updated: result.count })
}
