import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMemberFromRequest } from '@/lib/memberAuth'
import { getTokenFromRequest } from '@/lib/auth'
import { getPresidentFromRequest } from '@/lib/memberAuth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const adminUser = getTokenFromRequest(req)
  if (adminUser) {
    const competitionId = searchParams.get('competitionId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const animals = await prisma.competitionAnimal.findMany({
      where: {
        ...(competitionId && { competitionId: parseInt(competitionId) }),
        ...(status && status !== 'all' && { status }),
        ...(search && {
          OR: [
            { member: { name: { contains: search } } },
            { member: { association: { name: { contains: search } } } },
            { species: { contains: search } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        member: { select: { id: true, name: true, phone: true, association: { select: { id: true, name: true } } } },
        collectionGroup: { select: { id: true, groupNumber: true, groupScore: true } },
      },
    })
    return NextResponse.json(animals)
  }

  // Başkan: kendi derneğinin tüm hayvanlarını görür
  const president = getPresidentFromRequest(req)
  if (president) {
    const competitionId = searchParams.get('competitionId')
    const animals = await prisma.competitionAnimal.findMany({
      where: {
        member: { associationId: president.associationId },
        ...(competitionId && { competitionId: parseInt(competitionId) }),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        member: { select: { id: true, name: true } },
        collectionGroup: { select: { groupNumber: true } },
      },
    })
    return NextResponse.json(animals)
  }

  // Üye: kendi hayvanlarını görür
  const member = getMemberFromRequest(req)
  if (member) {
    const competitionId = searchParams.get('competitionId')
    const animals = await prisma.competitionAnimal.findMany({
      where: {
        memberId: member.id,
        ...(competitionId && { competitionId: parseInt(competitionId) }),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        collectionGroup: { select: { id: true, groupNumber: true } },
      },
    })
    return NextResponse.json(animals)
  }

  return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  const member = getMemberFromRequest(req)
  if (!member) return NextResponse.json({ error: 'Üye girişi gerekli' }, { status: 401 })

  const body = await req.json()
  const {
    competitionId, animalType, breed, gender, species, color,
    braceletYear, braceletNumber, chipNumber, tattooLeftEar, tattooRightEar,
    birthMonth, birthYear, entryType, collectionGroupId,
  } = body

  if (!competitionId || !animalType || !species || !color) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
  }

  // Tavşan kimlik validasyonu
  if (animalType === 'TAVSAN') {
    if (!birthMonth || !birthYear) return NextResponse.json({ error: 'Tavşan için doğum tarihi zorunlu' }, { status: 400 })
    const hasChip = chipNumber?.trim()
    const hasTattoo = tattooLeftEar?.trim() && tattooRightEar?.trim()
    if (!hasChip && !hasTattoo) return NextResponse.json({ error: 'Cip veya dövme numarası zorunlu' }, { status: 400 })
    if (hasChip && hasChip.length !== 15) return NextResponse.json({ error: 'Cip numarası 15 hane olmalı' }, { status: 400 })
    if (hasTattoo) {
      if (tattooLeftEar.trim().length !== 6) return NextResponse.json({ error: 'Sol kulak dövmesi 6 hane olmalı' }, { status: 400 })
      if (tattooRightEar.trim().length !== 7) return NextResponse.json({ error: 'Sağ kulak dövmesi 7 hane olmalı' }, { status: 400 })
    }
  }

  // Koleksiyon validasyonu
  if (entryType === 'COLLECTION' && collectionGroupId) {
    const group = await prisma.collectionGroup.findUnique({
      where: { id: collectionGroupId },
      include: { animals: true },
    })
    if (!group) return NextResponse.json({ error: 'Koleksiyon grubu bulunamadı' }, { status: 404 })
    if (group.animals.length >= 4) return NextResponse.json({ error: 'Koleksiyon en fazla 4 hayvan içerebilir' }, { status: 400 })

    // Aynı cins ve renk zorunluluğu
    if (group.animals.length > 0) {
      const groupSpecies = group.animals[0].species
      const groupColor = group.animals[0].color
      if (species !== groupSpecies) {
        return NextResponse.json({ error: `Koleksiyondaki tüm hayvanlar aynı cins olmalı: "${groupSpecies}"` }, { status: 400 })
      }
      if (color !== groupColor) {
        return NextResponse.json({ error: `Koleksiyondaki tüm hayvanlar aynı renk olmalı: "${groupColor}"` }, { status: 400 })
      }
    }

    // Cinsiyet/tür bileşim kontrolü
    const validationError = validateCollectionComposition(animalType, gender, group.animals, body)
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const animal = await prisma.competitionAnimal.create({
    data: {
      competitionId: parseInt(competitionId),
      memberId: member.id,
      animalType,
      breed: breed || null,
      gender: gender || null,
      species,
      color,
      braceletYear: braceletYear ? parseInt(braceletYear) : null,
      braceletNumber: braceletNumber || null,
      chipNumber: chipNumber || null,
      tattooLeftEar: tattooLeftEar || null,
      tattooRightEar: tattooRightEar || null,
      birthMonth: birthMonth ? parseInt(birthMonth) : null,
      birthYear: birthYear ? parseInt(birthYear) : null,
      entryType: entryType || 'SINGLE',
      collectionGroupId: collectionGroupId ? parseInt(collectionGroupId) : null,
      status: 'pending',
    },
    include: { collectionGroup: { select: { id: true, groupNumber: true } } },
  })

  return NextResponse.json(animal, { status: 201 })
}

function validateCollectionComposition(
  newType: string,
  newGender: string | undefined,
  existing: any[],
  body: any
): string | null {
  // Tavuk-Horoz özel kuralı
  if (newType === 'TAVUK' || newType === 'HOROZ') {
    const horozCount = existing.filter(a => a.animalType === 'HOROZ').length + (newType === 'HOROZ' ? 1 : 0)
    const tavukCount = existing.filter(a => a.animalType === 'TAVUK').length + (newType === 'TAVUK' ? 1 : 0)
    const total = horozCount + tavukCount
    if (total > 4) return 'Koleksiyon en fazla 4 hayvan içerebilir'
    if (total === 4) {
      const valid = [
        [2, 2], [1, 3], [3, 1],
      ].some(([h, t]) => horozCount === h && tavukCount === t)
      if (!valid) return 'Geçerli koleksiyon bileşimleri: 2 Horoz 2 Tavuk, 1 Tavuk 3 Horoz, 3 Tavuk 1 Horoz'
    }
    return null
  }

  // Genel kural: 2E2D / 1D3E / 3D1E
  const erkekCount = existing.filter(a => a.gender === 'ERKEK').length + (newGender === 'ERKEK' ? 1 : 0)
  const disiCount = existing.filter(a => a.gender === 'DISI').length + (newGender === 'DISI' ? 1 : 0)
  const total = erkekCount + disiCount
  if (total > 4) return 'Koleksiyon en fazla 4 hayvan içerebilir'
  if (total === 4) {
    const valid = [[2, 2], [3, 1], [1, 3]].some(([e, d]) => erkekCount === e && disiCount === d)
    if (!valid) return 'Geçerli koleksiyon bileşimleri: 2 Erkek 2 Dişi, 1 Dişi 3 Erkek, 3 Dişi 1 Erkek'
  }
  return null
}
