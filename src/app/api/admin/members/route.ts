import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const members = await prisma.member.findMany({
    orderBy: { createdAt: 'desc' },
    include: { association: { select: { name: true } } },
    omit: { password: true } as any,
  })
  return NextResponse.json(members)
}
