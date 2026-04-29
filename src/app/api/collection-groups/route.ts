import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMemberFromRequest } from '@/lib/memberAuth'

export async function POST(req: NextRequest) {
  const member = getMemberFromRequest(req)
  if (!member) return NextResponse.json({ error: 'Üye girişi gerekli' }, { status: 401 })

  const { competitionId } = await req.json()
  if (!competitionId) return NextResponse.json({ error: 'Yarışma ID zorunlu' }, { status: 400 })

  // Bu üyenin bu yarışmadaki son koleksiyon numarasını bul
  const lastGroup = await prisma.collectionGroup.findFirst({
    where: { memberId: member.id, competitionId: parseInt(competitionId) },
    orderBy: { groupNumber: 'desc' },
  })
  const nextGroupNumber = (lastGroup?.groupNumber ?? 0) + 1

  const group = await prisma.collectionGroup.create({
    data: {
      competitionId: parseInt(competitionId),
      memberId: member.id,
      groupNumber: nextGroupNumber,
    },
  })
  return NextResponse.json(group, { status: 201 })
}

export async function GET(req: NextRequest) {
  const member = getMemberFromRequest(req)
  if (!member) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const competitionId = searchParams.get('competitionId')

  const groups = await prisma.collectionGroup.findMany({
    where: {
      memberId: member.id,
      ...(competitionId && { competitionId: parseInt(competitionId) }),
    },
    include: { animals: true },
    orderBy: { groupNumber: 'asc' },
  })
  return NextResponse.json(groups)
}
