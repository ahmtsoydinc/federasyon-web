import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { animals: true } } },
  })
  return NextResponse.json(competitions)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!user || !['superadmin', 'moderator'].includes(user.role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { name, location, registrationStart, registrationEnd, eventDate, isActive } = await req.json()
  if (!name || !registrationStart || !registrationEnd) {
    return NextResponse.json({ error: 'Ad, kayıt başlangıcı ve bitiş zorunlu' }, { status: 400 })
  }

  // Yeni yarışma aktifse diğerlerini pasife çek
  if (isActive) {
    await prisma.competition.updateMany({ where: { isActive: true }, data: { isActive: false } })
  }

  const competition = await prisma.competition.create({
    data: {
      name,
      location: location || null,
      registrationStart: new Date(registrationStart),
      registrationEnd: new Date(registrationEnd),
      eventDate: eventDate ? new Date(eventDate) : null,
      isActive: isActive ?? true,
    },
  })
  return NextResponse.json(competition, { status: 201 })
}
