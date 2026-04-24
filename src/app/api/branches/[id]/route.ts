import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = parseInt(params.id)
  const body = await req.json()
  const branch = await prisma.branch.update({ where: { id }, data: body })
  return NextResponse.json(branch)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = parseInt(params.id)
  await prisma.branch.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
