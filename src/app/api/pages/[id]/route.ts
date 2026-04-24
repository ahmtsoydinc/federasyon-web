import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = parseInt(params.id)
  const { title, content, pdfUrl } = await req.json()
  const page = await prisma.page.update({ where: { id }, data: { title, content, pdfUrl: pdfUrl ?? null } })
  return NextResponse.json(page)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = parseInt(params.id)
  await prisma.page.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
