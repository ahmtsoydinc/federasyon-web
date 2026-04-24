import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const [posts, announcements, documents, boardMembers, members, associations, pendingOrders, fedPendingOrders] = await Promise.all([
    prisma.post.count(),
    prisma.announcement.count(),
    prisma.document.count(),
    prisma.boardMember.count(),
    prisma.member.count({ where: { active: true } }),
    prisma.association.count({ where: { active: true } }),
    prisma.braceletOrder.count({ where: { status: 'pending' } }),
    prisma.braceletOrder.count({ where: { status: 'assoc_approved' } }),
  ])

  return NextResponse.json({
    posts, announcements, documents, boardMembers,
    members, associations, pendingOrders, fedPendingOrders,
  })
}
