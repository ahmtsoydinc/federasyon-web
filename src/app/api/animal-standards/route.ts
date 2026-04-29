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

  // Benzersiz cins listesi — sadece species alanını çek, DB'de distinct yap
  if (searchParams.get('distinct') === 'species') {
    const rows = await prisma.animalStandard.findMany({
      where,
      select: { species: true },
      distinct: ['species'],
      orderBy: { species: 'asc' },
    })
    return NextResponse.json(rows.map(r => r.species))
  }

  // Belirli cins için renkler — sadece color alanını çek, DB'de distinct yap
  const sp = searchParams.get('species')
  if (sp) {
    const rows = await prisma.animalStandard.findMany({
      where: { ...where, species: sp },
      select: { color: true },
      distinct: ['color'],
      orderBy: { color: 'asc' },
    })
    return NextResponse.json(rows.map(r => r.color))
  }

  // Sayfalı liste (admin panel)
  if (searchParams.get('count') === 'true') {
    const [total, data] = await Promise.all([
      prisma.animalStandard.count({ where }),
      prisma.animalStandard.findMany({
        where,
        orderBy: [{ species: 'asc' }, { color: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])
    return NextResponse.json({ total, data })
  }

  // Tam liste
  const standards = await prisma.animalStandard.findMany({
    where,
    orderBy: [{ species: 'asc' }, { color: 'asc' }],
  })
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
