import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const id = parseInt(params.id)
  const { slug, label, fullTitle, color, order } = await req.json()

  const cat = await prisma.standardCategory.update({
    where: { id },
    data: { slug, label, fullTitle, color, order },
  })
  return NextResponse.json(cat)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const id = parseInt(params.id)
  await prisma.standardCategory.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
