import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const standardId = parseInt(params.id)
  const { url, caption, order } = await req.json()
  if (!url) return NextResponse.json({ error: 'url zorunlu' }, { status: 400 })

  const image = await prisma.standardImage.create({
    data: { standardId, url, caption: caption || null, order: order ?? 0 },
  })
  return NextResponse.json(image, { status: 201 })
}
