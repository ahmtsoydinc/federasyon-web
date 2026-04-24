import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

const SETTING_KEY = 'nav_menu'

const DEFAULT_MENU = [
  { id: 1, label: 'Ana Sayfa', href: '/', active: true },
  {
    id: 2, label: 'Federasyon', href: '#', active: true,
    children: [
      { label: 'Hakkımızda', href: '/hakkimizda' },
      { label: 'Yönetim Kurulu', href: '/yonetim' },
      { label: 'Denetim Kurulu', href: '/denetim' },
      { label: 'Disiplin Kurulu', href: '/disiplin' },
    ],
  },
  { id: 3, label: 'Haberler', href: '/haberler', active: true },
  { id: 4, label: 'Duyurular', href: '/duyurular', active: true },
  {
    id: 5, label: 'Branşlar', href: '/branslar', active: true,
    children: [
      { label: 'Tüm Branşlar', href: '/branslar' },
      { label: '─────────────', href: '#', divider: true },
      { label: '📋 Terminoloji ve Genel Listeler', href: 'https://tshfedstandartlar.com/', newTab: true },
      { label: '🐓 Dev Irk Tavuk Standartları', href: 'https://tshfedstandartlar.com/Dev.php', newTab: true },
      { label: '🐤 Cüce Tavuk Standartları', href: 'https://tshfedstandartlar.com/Cuce.php', newTab: true },
      { label: '🪿 Kaz Standartları', href: 'https://tshfedstandartlar.com/Kaz.php', newTab: true },
      { label: '🦆 Ördek Standartları', href: 'https://tshfedstandartlar.com/Ordek.php', newTab: true },
      { label: '🦃 Hindi Standartları', href: 'https://tshfedstandartlar.com/Hindi.php', newTab: true },
      { label: '🐦 Beç Tavukları', href: 'https://tshfedstandartlar.com/Bec.php', newTab: true },
      { label: '🇹🇷 Yerli Irkları Taslaklar', href: 'https://tshfedstandartlar.com/Yerli.php', newTab: true },
    ],
  },
  { id: 6, label: 'Belgeler', href: '/belgeler', active: true },
  { id: 7, label: 'İletişim', href: '/iletisim', active: true },
  { id: 8, label: 'Komisyonlar', href: '/sayfalar/komisyonlar', active: true },
]

export async function GET() {
  try {
    const setting = await prisma.siteSettings.findUnique({ where: { key: SETTING_KEY } })
    if (setting?.value) {
      return NextResponse.json(JSON.parse(setting.value))
    }
  } catch {}
  return NextResponse.json(DEFAULT_MENU)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const menu = await req.json()
  await prisma.siteSettings.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(menu) },
    create: { key: SETTING_KEY, value: JSON.stringify(menu) },
  })
  return NextResponse.json({ ok: true })
}
