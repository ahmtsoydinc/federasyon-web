import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHakemFromRequest } from '@/lib/hakemAuth'

export async function GET(req: NextRequest, { params }: { params: { number: string } }) {
  const hakem = getHakemFromRequest(req)
  if (!hakem) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const cageNumber = parseInt(params.number)
  if (isNaN(cageNumber)) return NextResponse.json({ error: 'Geçersiz kafes numarası' }, { status: 400 })

  const animal = await prisma.competitionAnimal.findFirst({
    where: { cageNumber, status: 'fed_approved' },
    select: {
      id: true,
      animalType: true,
      breed: true,
      gender: true,
      species: true,
      color: true,
      braceletYear: true,
      braceletNumber: true,
      entryType: true,
      cageNumber: true,
      individualScore: true,
      judgeStrengths: true,
      judgeRecommendations: true,
      collectionGroup: { select: { groupNumber: true, groupScore: true } },
      // member ve association kasıtlı olarak hariç tutuldu
    },
  })

  if (!animal) return NextResponse.json({ error: 'Kafes bulunamadı' }, { status: 404 })
  return NextResponse.json(animal)
}

export async function PUT(req: NextRequest, { params }: { params: { number: string } }) {
  const hakem = getHakemFromRequest(req)
  if (!hakem) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const cageNumber = parseInt(params.number)
  if (isNaN(cageNumber)) return NextResponse.json({ error: 'Geçersiz kafes numarası' }, { status: 400 })

  const animal = await prisma.competitionAnimal.findFirst({
    where: { cageNumber, status: 'fed_approved' },
  })
  if (!animal) return NextResponse.json({ error: 'Kafes bulunamadı' }, { status: 404 })

  const { braceletNumber, judgeStrengths, judgeRecommendations, individualScore } = await req.json()

  const updated = await prisma.competitionAnimal.update({
    where: { id: animal.id },
    data: {
      ...(braceletNumber !== undefined && { braceletNumber: String(braceletNumber) }),
      ...(judgeStrengths !== undefined && { judgeStrengths }),
      ...(judgeRecommendations !== undefined && { judgeRecommendations }),
      ...(individualScore !== undefined && { individualScore: individualScore === '' ? null : Number(individualScore) }),
    },
    select: {
      id: true, animalType: true, breed: true, gender: true, species: true, color: true,
      braceletYear: true, braceletNumber: true, cageNumber: true,
      individualScore: true, judgeStrengths: true, judgeRecommendations: true,
    },
  })

  return NextResponse.json(updated)
}
