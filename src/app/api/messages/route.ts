import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'
import { getMemberFromRequest } from '@/lib/memberAuth'

export async function GET(req: NextRequest) {
  // Üye kendi mesajlarını görür
  const member = getMemberFromRequest(req)
  if (member) {
    const msgs = await prisma.memberMessage.findMany({
      where: { memberId: member.id },
      include: { message: true },
      orderBy: { message: { createdAt: 'desc' } },
    })
    return NextResponse.json(msgs)
  }

  // Admin tüm mesajları görür
  const adminUser = getTokenFromRequest(req)
  if (requireAdmin(adminUser)) {
    const msgs = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(msgs)
  }

  return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  const adminUser = getTokenFromRequest(req)
  if (!requireAdmin(adminUser)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { title, content, targetType, targetId } = await req.json()
  if (!title || !content || !targetType) {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: { title, content, senderName: adminUser!.name, targetType, targetId: targetId ? Number(targetId) : null },
  })

  // Alıcıları belirle ve MemberMessage oluştur
  let members: { id: number }[] = []

  if (targetType === 'all') {
    members = await prisma.member.findMany({ where: { active: true }, select: { id: true } })
  } else if (targetType === 'association' && targetId) {
    members = await prisma.member.findMany({ where: { associationId: Number(targetId), active: true }, select: { id: true } })
  } else if (targetType === 'member' && targetId) {
    members = [{ id: Number(targetId) }]
  }

  if (members.length > 0) {
    await prisma.memberMessage.createMany({
      data: members.map((m) => ({ memberId: m.id, messageId: message.id })),
    })
  }

  return NextResponse.json({ message, sent: members.length }, { status: 201 })
}
