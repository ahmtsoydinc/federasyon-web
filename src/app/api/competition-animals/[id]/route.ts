import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMemberFromRequest } from '@/lib/memberAuth'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const animal = await prisma.competitionAnimal.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      member: { select: { id: true, name: true, association: { select: { id: true, name: true } } } },
      collectionGroup: { select: { id: true, groupNumber: true, groupScore: true } },
    },
  })
  if (!animal) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json(animal)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const adminUser = getTokenFromRequest(req)
  const member = getMemberFromRequest(req)

  const id = parseInt(params.id)
  const body = await req.json()

  if (adminUser) {
    // Moderatör/admin: tüm alanları güncelleyebilir
    const {
      animalType, breed, gender, species, color, braceletYear, braceletNumber,
      chipNumber, tattooLeftEar, tattooRightEar, birthMonth, birthYear,
      individualScore, judgeStrengths, judgeRecommendations, awards,
      collectionGroupId, status, rejectionNote,
    } = body

    const updated = await prisma.competitionAnimal.update({
      where: { id },
      data: {
        ...(animalType !== undefined && { animalType }),
        ...(breed !== undefined && { breed }),
        ...(gender !== undefined && { gender }),
        ...(species !== undefined && { species }),
        ...(color !== undefined && { color }),
        ...(braceletYear !== undefined && { braceletYear: braceletYear ? parseInt(braceletYear) : null }),
        ...(braceletNumber !== undefined && { braceletNumber }),
        ...(chipNumber !== undefined && { chipNumber }),
        ...(tattooLeftEar !== undefined && { tattooLeftEar }),
        ...(tattooRightEar !== undefined && { tattooRightEar }),
        ...(birthMonth !== undefined && { birthMonth: birthMonth ? parseInt(birthMonth) : null }),
        ...(birthYear !== undefined && { birthYear: birthYear ? parseInt(birthYear) : null }),
        ...(individualScore !== undefined && { individualScore: individualScore === '' ? null : Number(individualScore) }),
        ...(judgeStrengths !== undefined && { judgeStrengths }),
        ...(judgeRecommendations !== undefined && { judgeRecommendations }),
        ...(awards !== undefined && { awards: JSON.stringify(awards) }),
        ...(collectionGroupId !== undefined && { collectionGroupId: collectionGroupId ? parseInt(collectionGroupId) : null }),
        ...(status !== undefined && { status }),
        ...(rejectionNote !== undefined && { rejectionNote }),
      },
    })
    return NextResponse.json(updated)
  }

  if (member) {
    // Üye: sadece pending durumundaki kendi hayvanlarını düzenleyebilir
    const animal = await prisma.competitionAnimal.findUnique({ where: { id } })
    if (!animal || animal.memberId !== member.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    if (animal.status !== 'pending') return NextResponse.json({ error: 'Onay sürecindeki hayvan düzenlenemez' }, { status: 400 })

    const {
      animalType, breed, gender, species, color, braceletYear, braceletNumber,
      chipNumber, tattooLeftEar, tattooRightEar, birthMonth, birthYear,
    } = body

    const updated = await prisma.competitionAnimal.update({
      where: { id },
      data: {
        ...(animalType !== undefined && { animalType }),
        ...(breed !== undefined && { breed }),
        ...(gender !== undefined && { gender }),
        ...(species !== undefined && { species }),
        ...(color !== undefined && { color }),
        ...(braceletYear !== undefined && { braceletYear: braceletYear ? parseInt(braceletYear) : null }),
        ...(braceletNumber !== undefined && { braceletNumber }),
        ...(chipNumber !== undefined && { chipNumber }),
        ...(tattooLeftEar !== undefined && { tattooLeftEar }),
        ...(tattooRightEar !== undefined && { tattooRightEar }),
        ...(birthMonth !== undefined && { birthMonth: birthMonth ? parseInt(birthMonth) : null }),
        ...(birthYear !== undefined && { birthYear: birthYear ? parseInt(birthYear) : null }),
      },
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const member = getMemberFromRequest(req)
  const adminUser = getTokenFromRequest(req)
  const id = parseInt(params.id)

  if (adminUser) {
    await prisma.competitionAnimal.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  }

  if (member) {
    const animal = await prisma.competitionAnimal.findUnique({ where: { id } })
    if (!animal || animal.memberId !== member.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    if (animal.status !== 'pending') return NextResponse.json({ error: 'Onay sürecindeki hayvan silinemez' }, { status: 400 })
    await prisma.competitionAnimal.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
}
