import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const adminUser = getTokenFromRequest(req)
  if (!requireAdmin(adminUser)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const id = parseInt(params.id)
  if (!id) return NextResponse.json({ error: 'Geçersiz id' }, { status: 400 })

  await prisma.braceletOrder.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
