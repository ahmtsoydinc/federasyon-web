import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMemberFromRequest } from '@/lib/memberAuth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const member = getMemberFromRequest(req)
  if (!member) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const messageId = parseInt(params.id)
  await prisma.memberMessage.updateMany({
    where: { memberId: member.id, messageId, read: false },
    data: { read: true, readAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
