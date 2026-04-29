import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPresidentFromRequest } from '@/lib/memberAuth'
import { getTokenFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const president = getPresidentFromRequest(req)
  const adminUser = getTokenFromRequest(req)

  const id = parseInt(params.id)
  const { note } = await req.json()

  const animal = await prisma.competitionAnimal.findUnique({
    where: { id },
    include: { member: { select: { associationId: true } } },
  })
  if (!animal) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  if (president && animal.member.associationId !== president.associationId) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }
  if (!president && !adminUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const updated = await prisma.competitionAnimal.update({
    where: { id },
    data: { status: 'rejected', rejectionNote: note || null },
  })
  return NextResponse.json(updated)
}
