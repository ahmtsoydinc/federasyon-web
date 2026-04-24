import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'
import * as XLSX from 'xlsx'

const STATUS_LABEL: Record<string, string> = {
  pending:        'Başkan Onayı Bekleniyor',
  assoc_approved: 'Federasyon Onayı Bekleniyor',
  fed_approved:   'Onaylandı',
  rejected:       'Reddedildi',
}

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const orders = await prisma.braceletOrder.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      member: { select: { name: true, email: true } },
      association: { select: { name: true } },
    },
  })

  const rows = orders.map((o, i) => ({
    'Sıra':             i + 1,
    'Sipariş No':       o.id,
    'Sipariş Tarihi':   new Date(o.createdAt).toLocaleDateString('tr-TR'),
    'Üye Adı':          o.member?.name ?? '',
    'E-posta':          o.member?.email ?? '',
    'Dernek':           o.association?.name ?? '',
    'Bilezik No':       o.braceletNumber,
    'Adet':             o.quantity,
    'Birim Fiyat (₺)':  Number(o.pricePerUnit),
    'Toplam Tutar (₺)': Number(o.totalAmount),
    'Durum':            STATUS_LABEL[o.status] ?? o.status,
    'Başkan Notu':      o.presidentNote ?? '',
    'Federasyon Notu':  o.adminNote ?? '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Sütun genişlikleri
  ws['!cols'] = [
    { wch: 5 },  // Sıra
    { wch: 10 }, // Sipariş No
    { wch: 14 }, // Tarih
    { wch: 24 }, // Üye Adı
    { wch: 28 }, // E-posta
    { wch: 28 }, // Dernek
    { wch: 12 }, // Bilezik No
    { wch: 8 },  // Adet
    { wch: 16 }, // Birim Fiyat
    { wch: 16 }, // Toplam
    { wch: 28 }, // Durum
    { wch: 30 }, // Başkan Notu
    { wch: 30 }, // Fed Notu
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Bilezik Siparişleri')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const filename = `bilezik-siparisler-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
