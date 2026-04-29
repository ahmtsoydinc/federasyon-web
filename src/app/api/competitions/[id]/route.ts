import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const competition = await prisma.competition.findUnique({
    where: { id: parseInt(params.id) },
    include: { _count: { select: { animals: true } } },
  })
  if (!competition) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json(competition)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!user || !['superadmin', 'moderator'].includes(user.role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { name, location, registrationStart, registrationEnd, eventDate, isActive } = await req.json()
  const id = parseInt(params.id)

  if (isActive) {
    await prisma.competition.updateMany({ where: { isActive: true, id: { not: id } }, data: { isActive: false } })
  }

  const competition = await prisma.competition.update({
    where: { id },
    data: {
      ...(name && { name }),
      location: location ?? null,
      ...(registrationStart && { registrationStart: new Date(registrationStart) }),
      ...(registrationEnd && { registrationEnd: new Date(registrationEnd) }),
      eventDate: eventDate ? new Date(eventDate) : null,
      ...(isActive !== undefined && { isActive }),
    },
  })
  return NextResponse.json(competition)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!user || user.role !== 'superadmin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  await prisma.competition.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
