import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const slider = await prisma.slider.update({
    where: { id: Number(params.id) },
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

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.slider.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
