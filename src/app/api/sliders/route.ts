import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all')
  const sliders = await prisma.slider.findMany({
    where: all ? undefined : { active: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(sliders)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const slider = await prisma.slider.create({
    data: {
      title: data.title,
      subtitle: data.subtitle || null,
      imageUrl: data.imageUrl || '',
      videoUrl: data.videoUrl || null,
      linkUrl: data.linkUrl || null,
      linkLabel: data.linkLabel || null,
      active: data.active ?? true,
      order: data.order ?? 0,
    },
  })
  return NextResponse.json(slider)
}
