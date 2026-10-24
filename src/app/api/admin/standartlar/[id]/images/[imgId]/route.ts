import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string; imgId: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  await prisma.standardImage.delete({ where: { id: parseInt(params.imgId) } })
  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; imgId: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { caption, order } = await req.json()
  const image = await prisma.standardImage.update({
    where: { id: parseInt(params.imgId) },
    data: { caption: caption ?? undefined, order: order ?? undefined },
  })
  return NextResponse.json(image)
}
