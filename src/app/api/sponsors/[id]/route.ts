import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const sponsor = await prisma.sponsor.update({
    where: { id: Number(params.id) },
    data: {
      name: data.name,
      logoUrl: data.logoUrl ?? null,
      websiteUrl: data.websiteUrl ?? null,
      isMain: data.isMain ?? false,
      order: data.order ?? 0,
      active: data.active ?? true,
    },
  })
  return NextResponse.json(sponsor)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.sponsor.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
