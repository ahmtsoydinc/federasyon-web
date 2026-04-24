import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = parseInt(params.id)
  const body = await req.json()
  const assoc = await prisma.association.update({
    where: { id },
    data: {
      name: body.name,
      city: body.city ?? null,
      active: body.active ?? true,
      isBireysel: body.isBireysel ?? false,
    },
  })
  return NextResponse.json(assoc)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = parseInt(params.id)
  await prisma.association.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ success: true })
}
