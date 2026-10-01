import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const memberToken = getMemberFromRequest(req)
  if (!memberToken) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const member = await prisma.member.findUnique({
    where: { id: memberToken.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      kvkkApproved: true,
      approved: true,
      active: true,
      associationId: true,
      association: { select: { id: true, name: true, city: true } },
      createdAt: true,
    },
  })

  if (!member) return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 })
  return NextResponse.json(member)
}
