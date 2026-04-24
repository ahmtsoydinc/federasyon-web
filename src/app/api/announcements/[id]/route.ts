import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const id = parseInt(params.id)
  const body = await req.json()
  const ann = await prisma.announcement.update({ where: { id }, data: body })
  return NextResponse.json(ann)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const id = parseInt(params.id)
  await prisma.announcement.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
