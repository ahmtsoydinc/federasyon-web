import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberAuth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const memberToken = getMemberFromRequest(req)
  if (!memberToken) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  await prisma.member.update({
    where: { id: memberToken.id },
    data: { kvkkApproved: true },
  })

  return NextResponse.json({ success: true })
}
