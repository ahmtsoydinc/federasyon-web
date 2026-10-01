import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const members = await prisma.member.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, phone: true, active: true, approved: true, kvkkApproved: true, createdAt: true, association: { select: { name: true } } },
  })
  return NextResponse.json(members)
}
