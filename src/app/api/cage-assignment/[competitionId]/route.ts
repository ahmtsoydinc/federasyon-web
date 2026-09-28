import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'

// Dev ırk sıralama listesi (federasyon standardı)
const DEV_SPECIES_ORDER: string[] = [
  'Shamo',
  'Brahma',
  'Cochin',
  'Australorp',
  'Wyandotte',
  'Amrock',
  'Plymouth',
  'Vorwerk',
  'Lakenvelder',
  'Orpington',
  'Faverolles',
  'Sussex',
  'Krem Legbar',
  'New Hampshire',
  'Orloff',
  'Sumatra',
  'Yokohama',
  'Bresse',
]

// 1. Ana grup: beden+tür (cinsiyet bu aşamada YOK — cins adından sonra gelecek)
function getSizeGroupKey(animal: { animalType: string; breed: string | null }): number {
  const t = animal.animalType
  const b = animal.breed
  if ((t === 'HOROZ' || t === 'TAVUK') && b === 'DEV')  return 1
  if ((t === 'HOROZ' || t === 'TAVUK') && b === 'CUCE') return 2
  if (t === 'HOROZ' || t === 'TAVUK') return 2
  if (t === 'GUVERCIN')  return 3
  if (t === 'BILDIRCIN') return 4
  if (t === 'TAVSAN')    return 5
  if (t === 'ORDEK')     return 6
  if (t === 'KAZ')       return 7
  if (t === 'HINDI')     return 8
  return 9
}

// 2. Cins sırası (Dev ırklar için özel liste)
function getSpeciesSortKey(species: string | null, breed: string | null): number {
  if (!species) return 9999
  if (breed === 'DEV') {
    const idx = DEV_SPECIES_ORDER.findIndex(
      s => s.toLowerCase() === species.toLowerCase()
    )
    if (idx !== -1) return idx
  }
  return 1000
}

// 3. Cinsiyet: Horoz önce
function getSexKey(animalType: string): number {
  return animalType === 'HOROZ' ? 1 : 2
}

function compareAnimals(
  a: { animalType: string; breed: string | null; species: string | null; color: string | null; id: number },
  b: { animalType: string; breed: string | null; species: string | null; color: string | null; id: number }
): number {
  // 1. Beden grubu (Dev / Cüce / diğer hayvanlar)
  const sg = getSizeGroupKey(a) - getSizeGroupKey(b)
  if (sg !== 0) return sg

  // 2. Cins adı — aynı cins birlikte kalır
  const specKey = getSpeciesSortKey(a.species, a.breed) - getSpeciesSortKey(b.species, b.breed)
  if (specKey !== 0) return specKey
  const specCmp = (a.species || '').localeCompare(b.species || '', 'tr')
  if (specCmp !== 0) return specCmp

  // 3. Cinsiyet: Horoz önce, Tavuk sonra
  const sex = getSexKey(a.animalType) - getSexKey(b.animalType)
  if (sex !== 0) return sex

  // 4. Renk
  const col = (a.color || '').localeCompare(b.color || '', 'tr')
  if (col !== 0) return col

  return a.id - b.id
}

export async function POST(req: NextRequest, { params }: { params: { competitionId: string } }) {
  const user = getTokenFromRequest(req)
  if (!user || !['superadmin', 'moderator'].includes(user.role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const competitionId = parseInt(params.competitionId)

  const animals = await prisma.competitionAnimal.findMany({
    where: { competitionId, status: 'fed_approved' },
    orderBy: { createdAt: 'asc' },
  })

  if (animals.length === 0) {
    return NextResponse.json({ error: 'Onaylanmış hayvan bulunamadı' }, { status: 400 })
  }

  const singles     = animals.filter(a => a.entryType === 'SINGLE')
  const collections = animals.filter(a => a.entryType === 'COLLECTION' && a.collectionGroupId !== null)

  const groupMap = new Map<number, typeof animals>()
  for (const animal of collections) {
    const gid = animal.collectionGroupId!
    if (!groupMap.has(gid)) groupMap.set(gid, [])
    groupMap.get(gid)!.push(animal)
  }

  // Tekleri sırala
  singles.sort(compareAnimals)

  // Koleksiyon gruplarını sırala — temsilci olarak gruptaki en küçük sort key'li hayvanı al
  const groupUnits: { rep: typeof animals[0]; animals: typeof animals }[] = []
  for (const [, groupAnimals] of groupMap.entries()) {
    groupAnimals.sort(compareAnimals)
    groupUnits.push({ rep: groupAnimals[0], animals: groupAnimals })
  }
  groupUnits.sort((a, b) => compareAnimals(a.rep, b.rep))

  // Tekler ve koleksiyonları birleştir
  type Unit = { rep: typeof animals[0]; items: typeof animals }
  const allUnits: Unit[] = [
    ...singles.map(a => ({ rep: a, items: [a] })),
    ...groupUnits.map(u => ({ rep: u.rep, items: u.animals })),
  ]
  allUnits.sort((a, b) => compareAnimals(a.rep, b.rep))

  // Kafes numarası ata
  let cageNum = 1
  const updates: { id: number; cageNumber: number }[] = []
  const now = new Date()

  for (const unit of allUnits) {
    for (const animal of unit.items) {
      updates.push({ id: animal.id, cageNumber: cageNum++ })
    }
  }

  await Promise.all(
    updates.map(u =>
      prisma.competitionAnimal.update({
        where: { id: u.id },
        data: { cageNumber: u.cageNumber, cageAssignedAt: now },
      })
    )
  )

  return NextResponse.json({ assigned: updates.length })
}
