import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET() {
  const standards = await prisma.standard.findMany({
    orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
    },
  })
  return NextResponse.json(standards)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { categoryId, name, subtitle, breedPdfUrl, colourPdfUrl, breedDate, colourDate, isDraft, order } = await req.json()
  if (!categoryId || !name) return NextResponse.json({ error: 'categoryId ve name zorunlu' }, { status: 400 })

  const standard = await prisma.standard.create({
    data: {
      categoryId: parseInt(categoryId),
      name,
      subtitle: subtitle || null,
      breedPdfUrl: breedPdfUrl || null,
      colourPdfUrl: colourPdfUrl || null,
      breedDate: breedDate || null,
      colourDate: colourDate || null,
      isDraft: isDraft || false,
      order: order ?? 0,
    },
    include: { category: true, images: true },
  })
  return NextResponse.json(standard, { status: 201 })
}
