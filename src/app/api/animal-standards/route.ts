import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const animalType = searchParams.get('animalType')
  const breed = searchParams.get('breed')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  const where: any = {
    ...(animalType && { animalType }),
    ...(breed && breed !== 'all' && animalType !== 'TAVSAN' ? { breed } : {}),
    ...(search ? {
      OR: [
        { species: { contains: search } },
        { color: { contains: search } },
      ]
    } : {}),
  }

  const standards = await prisma.animalStandard.findMany({
    where,
    orderBy: [{ species: 'asc' }, { color: 'asc' }],
    ...(!searchParams.get('distinct') && !searchParams.get('species') && searchParams.get('page')
      ? { skip: (page - 1) * limit, take: limit }
      : {}),
  })

  // Toplam sayı (sayfalama için)
  if (searchParams.get('count') === 'true') {
    const total = await prisma.animalStandard.count({ where })
    return NextResponse.json({ total, data: standards })
  }

  // Benzersiz cins listesi
  if (searchParams.get('distinct') === 'species') {
    const species = [...new Set(standards.map(s => s.species))].sort()
    return NextResponse.json(species)
  }

  // Belirli cins için renkler
  if (searchParams.get('species')) {
    const sp = searchParams.get('species')
    const colors = standards.filter(s => s.species === sp).map(s => s.color)
    return NextResponse.json([...new Set(colors)].sort())
  }

  return NextResponse.json(standards)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { animalType, breed, species, color } = body

  if (!animalType || !species || !color) {
    return NextResponse.json({ error: 'animalType, species ve color zorunludur.' }, { status: 400 })
  }

  const record = await prisma.animalStandard.create({
    data: {
      animalType: animalType.trim().toUpperCase(),
      breed: breed ? breed.trim().toUpperCase() || null : null,
      species: species.trim(),
      color: color.trim(),
    },
  })

  return NextResponse.json(record, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') || '')
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 })

  await prisma.animalStandard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
