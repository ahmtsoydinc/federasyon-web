import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'

// Kafes sıralama önceliği
function getSortKey(animal: { animalType: string; breed: string | null }): number {
  const t = animal.animalType
  const b = animal.breed

  if ((t === 'HOROZ' || t === 'TAVUK') && b === 'DEV') return 1
  if ((t === 'HOROZ' || t === 'TAVUK') && b === 'CUCE') return 2
  if ((t === 'HOROZ' || t === 'TAVUK')) return 2 // breed belirtilmemişse cüce sayılır
  if (t === 'GUVERCIN') return 3
  if (t === 'BILDIRCIN') return 4
  if (t === 'TAVSAN') return 5
  if (t === 'ORDEK') return 6
  if (t === 'KAZ') return 7
  if (t === 'HINDI') return 8
  return 9
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

  // Tekler ve koleksiyonları ayır
  const singles = animals.filter(a => a.entryType === 'SINGLE')
  const collections = animals.filter(a => a.entryType === 'COLLECTION' && a.collectionGroupId !== null)

  // Koleksiyon gruplarını bir arada tut
  const groupMap = new Map<number, typeof animals>()
  for (const animal of collections) {
    const gid = animal.collectionGroupId!
    if (!groupMap.has(gid)) groupMap.set(gid, [])
    groupMap.get(gid)!.push(animal)
  }

  // Her grubu tek birim olarak temsil et (ilk hayvanının sort key'ini kullan)
  const groupUnits: { sortKey: number; groupId: number; animals: typeof animals }[] = []
  for (const [groupId, groupAnimals] of groupMap.entries()) {
    const sortKey = getSortKey(groupAnimals[0])
    groupUnits.push({ sortKey, groupId, animals: groupAnimals })
  }

  // Tekleri de birim olarak listele
  const singleUnits = singles.map(a => ({ sortKey: getSortKey(a), animal: a }))

  // Sırala: önce sort key, eşitse oluşturma zamanı
  singleUnits.sort((a, b) => a.sortKey - b.sortKey || a.animal.id - b.animal.id)
  groupUnits.sort((a, b) => a.sortKey - b.sortKey || a.groupId - b.groupId)

  // Tekler ve koleksiyonları birleştirerek kafes sırası oluştur
  // Her tür bloğu içinde önce tekler sonra koleksiyonlar (veya tam tersi değil,
  // sadece sort key bazlı karıştır)
  type Unit = { sortKey: number; items: typeof animals }
  const allUnits: Unit[] = [
    ...singleUnits.map(u => ({ sortKey: u.sortKey, items: [u.animal] })),
    ...groupUnits.map(u => ({ sortKey: u.sortKey, items: u.animals })),
  ]
  allUnits.sort((a, b) => a.sortKey - b.sortKey)

  // Kafes numarası ata
  let cageNum = 1
  const updates: { id: number; cageNumber: number }[] = []
  const now = new Date()

  for (const unit of allUnits) {
    for (const animal of unit.items) {
      updates.push({ id: animal.id, cageNumber: cageNum++ })
    }
  }

  // Toplu güncelle
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
