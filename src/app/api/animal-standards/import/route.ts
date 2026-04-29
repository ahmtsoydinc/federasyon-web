import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req)
    if (!user || !['superadmin', 'moderator'].includes(user.role)) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Dosya zorunlu' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    let workbook: XLSX.WorkBook
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' })
    } catch {
      return NextResponse.json({ error: 'Geçersiz Excel dosyası. .xlsx veya .xls formatı gerekli.' }, { status: 400 })
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (rows.length === 0) return NextResponse.json({ error: 'Dosya boş' }, { status: 400 })

    const normalize = (row: any) => ({
      animalType: (row['AnimalType'] || row['animalType'] || row['Tür'] || row['Tur'] || '').toString().trim().toUpperCase(),
      breed: (row['Breed'] || row['breed'] || row['Irk'] || '').toString().trim().toUpperCase() || null,
      species: (row['Species'] || row['species'] || row['Cins'] || '').toString().trim(),
      color: (row['Color'] || row['color'] || row['Renk'] || '').toString().trim(),
    })

    const records = rows.map(normalize).filter(r => r.animalType && r.species && r.color)

    if (records.length === 0) {
      return NextResponse.json({ error: 'Geçerli satır bulunamadı. Sütunlar: AnimalType, Breed, Species, Color' }, { status: 400 })
    }

    await prisma.animalStandard.deleteMany()
    const chunkSize = 100
    for (let i = 0; i < records.length; i += chunkSize) {
      await prisma.animalStandard.createMany({ data: records.slice(i, i + chunkSize) })
    }

    return NextResponse.json({ imported: records.length })
  } catch (err: any) {
    console.error('Animal standards import error:', err)
    return NextResponse.json({ error: err?.message ?? 'Sunucu hatası oluştu' }, { status: 500 })
  }
}
