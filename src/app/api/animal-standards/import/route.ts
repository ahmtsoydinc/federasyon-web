import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import * as XLSX from 'xlsx'

function getTursoUrl() {
  return process.env.DATABASE_URL!.replace('libsql://', 'https://')
}
function getTursoToken() {
  return process.env.DATABASE_AUTH_TOKEN!
}

async function tursoExecute(sql: string, args: any[] = []) {
  const res = await fetch(`${getTursoUrl()}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getTursoToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql, args } }, { type: 'close' }] }),
  })
  return res.json()
}

async function tursoBatch(statements: { sql: string; args: any[] }[]) {
  const requests = [
    ...statements.map(s => ({ type: 'execute', stmt: { sql: s.sql, args: s.args } })),
    { type: 'close' },
  ]
  const res = await fetch(`${getTursoUrl()}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getTursoToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  })
  return res.json()
}

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

    // Mevcut kayıtları temizle
    await tursoExecute('DELETE FROM AnimalStandard')

    // 500'lü batch'ler halinde Turso pipeline API ile ekle
    const CHUNK = 500
    for (let i = 0; i < records.length; i += CHUNK) {
      const chunk = records.slice(i, i + CHUNK)
      const statements = chunk.map(r => ({
        sql: 'INSERT INTO AnimalStandard (animalType, breed, species, color) VALUES (?, ?, ?, ?)',
        args: [
          { type: 'text', value: r.animalType },
          r.breed ? { type: 'text', value: r.breed } : { type: 'null' },
          { type: 'text', value: r.species },
          { type: 'text', value: r.color },
        ],
      }))
      await tursoBatch(statements)
    }

    return NextResponse.json({ imported: records.length })
  } catch (err: any) {
    console.error('Animal standards import error:', err)
    return NextResponse.json({ error: err?.message ?? 'Sunucu hatası oluştu' }, { status: 500 })
  }
}
