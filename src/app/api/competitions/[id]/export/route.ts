import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!user || !['superadmin', 'moderator'].includes(user.role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const competitionId = parseInt(params.id)
  if (isNaN(competitionId)) return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 })

  const competition = await (prisma as any).competition.findUnique({ where: { id: competitionId } })
  if (!competition) return NextResponse.json({ error: 'Yarışma bulunamadı' }, { status: 404 })

  const animals = await (prisma as any).competitionAnimal.findMany({
    where: { competitionId },
    include: {
      member: { include: { association: true } },
      collectionGroup: true,
    },
    orderBy: { cageNumber: 'asc' },
  })

  const TYPE_LABELS: Record<string, string> = {
    TAVUK: 'Tavuk', HOROZ: 'Horoz', ORDEK: 'Ördek', GUVERCIN: 'Güvercin',
    TAVSAN: 'Tavşan', KAZ: 'Kaz', HINDI: 'Hindi', BILDIRCIN: 'Bıldırcın',
  }

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Bekliyor', assoc_approved: 'Başkan Onaylı',
    fed_approved: 'Fed. Onaylı', rejected: 'Reddedildi',
  }

  const rows = animals.map((a: any) => {
    let awards: string[] = []
    try { awards = JSON.parse(a.awards || '[]') } catch { /* empty */ }

    return {
      'Kafes No': a.cageNumber ?? '—',
      'Durum': STATUS_LABELS[a.status] ?? a.status,
      'Tür': TYPE_LABELS[a.animalType] ?? a.animalType,
      'Irk': a.breed === 'DEV' ? 'Dev' : a.breed === 'CUCE' ? 'Cüce' : '—',
      'Cinsiyet': a.gender === 'ERKEK' ? 'Erkek' : a.gender === 'DISI' ? 'Dişi' : '—',
      'Cins': a.species,
      'Renk': a.color,
      'Kayıt Türü': a.entryType === 'COLLECTION' ? 'Koleksiyon' : 'Tek',
      'Koleksiyon No': a.collectionGroup ? `Koleksiyon ${a.collectionGroup.groupNumber}` : '—',
      'Bilezik Yılı': a.braceletYear ?? '—',
      'Bilezik No': a.braceletNumber ?? '—',
      'Bireysel Puan': a.individualScore ?? '—',
      'Grup Puanı': a.collectionGroup?.groupScore ?? '—',
      'Ödüller': awards.join(', ') || '—',
      'Üye': a.member?.name ?? '—',
      'Dernek': a.member?.association?.name ?? '—',
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sonuçlar')

  const colWidths = [
    { wch: 8 }, { wch: 14 }, { wch: 10 }, { wch: 6 }, { wch: 8 },
    { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 10 },
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 25 },
  ]
  ws['!cols'] = colWidths

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const safeName = competition.name.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '').trim()
  const filename = `yarisma-sonuclari-${safeName}.xlsx`

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
