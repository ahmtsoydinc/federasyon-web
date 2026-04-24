import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const payload = getMemberFromRequest(req)
  if (!payload) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const member = await prisma.member.findUnique({
    where: { id: payload.id },
    include: { association: true },
    omit: { password: true } as any,
  })
  if (!member) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  return NextResponse.json({ member })
}
