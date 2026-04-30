import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPresidentFromRequest } from '@/lib/memberAuth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const president = getPresidentFromRequest(req)
  if (!president) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const id = parseInt(params.id)
  const animal = await prisma.competitionAnimal.findUnique({
    where: { id },
    include: { member: { select: { associationId: true } } },
  })

  if (!animal) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  if (animal.member.associationId !== president.associationId) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }
  if (animal.status !== 'submitted') {
    return NextResponse.json({ error: 'Sadece gönderilmiş kayıtlar onaylanabilir' }, { status: 400 })
  }

  const updated = await prisma.competitionAnimal.update({
    where: { id },
    data: { status: 'assoc_approved', presidentApprovedAt: new Date() },
  })
  return NextResponse.json(updated)
}
