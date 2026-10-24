import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const standard = await prisma.standard.findUnique({
    where: { id: parseInt(params.id) },
    include: { category: true, images: { orderBy: { order: 'asc' } } },
  })
  if (!standard) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json(standard)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const id = parseInt(params.id)
  const { categoryId, name, subtitle, breedPdfUrl, colourPdfUrl, breedDate, colourDate, isDraft, order } = await req.json()

  const standard = await prisma.standard.update({
    where: { id },
    data: {
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      name,
      subtitle: subtitle ?? null,
      breedPdfUrl: breedPdfUrl ?? null,
      colourPdfUrl: colourPdfUrl ?? null,
      breedDate: breedDate ?? null,
      colourDate: colourDate ?? null,
      isDraft,
      order,
    },
    include: { category: true, images: { orderBy: { order: 'asc' } } },
  })
  return NextResponse.json(standard)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  await prisma.standard.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
