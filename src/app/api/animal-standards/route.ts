import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const animalType = searchParams.get('animalType')
  const breed = searchParams.get('breed')

  const standards = await prisma.animalStandard.findMany({
    where: {
      ...(animalType && { animalType }),
      ...(breed && breed !== 'all' ? { breed } : {}),
    },
    orderBy: [{ species: 'asc' }, { color: 'asc' }],
  })

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
