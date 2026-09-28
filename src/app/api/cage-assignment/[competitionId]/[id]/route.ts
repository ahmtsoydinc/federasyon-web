import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'

// ─── KAFES SIRALAMA DÜZENİ ───────────────────────────────────────────────────

const DEV_BREED_ORDER: Record<string, number> = {
  'shamo':             1,
  'brahma':            2,
  'cochin':            3,
  'australorp':        4,
  'austrolorp':        4,
  'wyandotte':         5,
  'amrock':            6,
  'plymouth':          7,
  'vorwerk':           8,
  'lakenvelder':       9,
  'orpington':         10,
  'alman faverolles':  11,
  'faverolles':        11,
  'sussex':            12,
  'krem legbar':       13,
  'legbar':            13,
  'new hampshire':     14,
  'hampshire':         14,
  'orloff':            15,
  'sumatra':           16,
  'yokahama':          17,
  'yokohama':          17,
  'bresse':            18,
}

function getGroupKey(a: any): number {
  const type = a.animalType
  const breed = (a.breed || '').toUpperCase()

  if ((type === 'TAVUK' || type === 'HOROZ') && breed === 'DEV')  return 1
  if ((type === 'TAVUK' || type === 'HOROZ') && breed === 'CUCE') return 2
  if (type === 'GUVERCIN')  return 3
  if (type === 'BILDIRCIN') return 4
  if (type === 'TAVSAN')    return 5
  if (type === 'ORDEK')     return 6
  if (type === 'KAZ')       return 7
  if (type === 'HINDI')     return 8
  return 99
}

function getBreedOrder(species: string): number {
  const key = (species || '').toLowerCase().trim()
  if (DEV_BREED_ORDER[key] !== undefined) return DEV_BREED_ORDER[key]
  for (const [name, order] of Object.entries(DEV_BREED_ORDER)) {
    if (key.includes(name) || name.includes(key)) return order
  }
  return 999
}

function sortAnimals(animals: any[]): any[] {
  return [...animals].sort((a, b) => {
    const ga = getGroupKey(a)
    const gb = getGroupKey(b)
    if (ga !== gb) return ga - gb

    if (ga <= 2) {
      const ba = getBreedOrder(a.species)
      const bb = getBreedOrder(b.species)
      if (ba !== bb) return ba - bb
    }

    const sa = (a.species || '').toLowerCase()
    const sb = (b.species || '').toLowerCase()
    if (sa !== sb) return sa.localeCompare(sb, 'tr')

    const ca = (a.color || '').toLowerCase()
    const cb = (b.color || '').toLowerCase()
    return ca.localeCompare(cb, 'tr')
  })
}

// ─── API ROUTE ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req)
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const competitionId = parseInt(params.id)

  const animals = await prisma.competitionAnimal.findMany({
    where: { competitionId, status: 'fed_approved' },
    select: {
      id: true, animalType: true, breed: true, species: true, color: true,
      entryType: true, collectionGroupId: true,
    },
  })

  if (animals.length === 0) {
    return NextResponse.json({ error: 'Kafes atanacak onaylı hayvan bulunamadı' }, { status: 400 })
  }

  await prisma.competitionAnimal.updateMany({
    where: { competitionId },
    data: { cageNumber: null, cageAssignedAt: null },
  })

  const sorted = sortAnimals(animals)
  const now = new Date()

  await Promise.all(
    sorted.map((a, i) =>
      prisma.competitionAnimal.update({
        where: { id: a.id },
        data: { cageNumber: i + 1, cageAssignedAt: now },
      })
    )
  )

  return NextResponse.json({ assigned: sorted.length, order: sorted.map((a, i) => ({ cage: i + 1, id: a.id, type: a.animalType, species: a.species, color: a.color })) })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req)
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const competitionId = parseInt(params.id)
  const animals = await prisma.competitionAnimal.findMany({
    where: { competitionId, cageNumber: { not: null } },
    orderBy: { cageNumber: 'asc' },
    select: {
      id: true, cageNumber: true, animalType: true, breed: true, species: true,
      color: true, braceletYear: true, braceletNumber: true, status: true,
      member: { select: { name: true, association: { select: { name: true } } } },
    },
  })

  return NextResponse.json(animals)
}
