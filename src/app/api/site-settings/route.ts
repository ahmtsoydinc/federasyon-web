import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Sosyal medya ile ilgili geçerli ayar anahtarları
const ALLOWED_KEYS = [
  'instagram_url',
  'facebook_url',
  'youtube_url',
  'youtube_video_id',
  'facebook_page_id',
  'x_url',
  'slider_interval',
]

export async function GET() {
  const settings = await prisma.siteSettings.findMany({
    where: { key: { in: ALLOWED_KEYS } },
  })
  const result: Record<string, string> = {}
  for (const s of settings) result[s.key] = s.value
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const data: Record<string, string> = await req.json()
  const ops = Object.entries(data)
    .filter(([key]) => ALLOWED_KEYS.includes(key))
    .map(([key, value]) =>
      prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  await Promise.all(ops)
  return NextResponse.json({ ok: true })
}
