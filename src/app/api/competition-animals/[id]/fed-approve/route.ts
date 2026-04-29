import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!user || !['superadmin', 'moderator'].includes(user.role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const id = parseInt(params.id)
  const animal = await prisma.competitionAnimal.findUnique({ where: { id } })
  if (!animal) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  if (animal.status !== 'assoc_approved') {
    return NextResponse.json({ error: 'Sadece dernek onaylı kayıtlar federasyon tarafından onaylanabilir' }, { status: 400 })
  }

  const updated = await prisma.competitionAnimal.update({
    where: { id },
    data: { status: 'fed_approved', fedApprovedAt: new Date() },
  })
  return NextResponse.json(updated)
}
