import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'
import { getPresidentFromRequest } from '@/lib/memberAuth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const { note } = await req.json().catch(() => ({ note: '' }))

  const president = getPresidentFromRequest(req)
  const adminUser = getTokenFromRequest(req)

  if (!president && !requireAdmin(adminUser)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const order = await prisma.braceletOrder.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })

  if (president && order.associationId !== president.associationId) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const updated = await prisma.braceletOrder.update({
    where: { id },
    data: {
      status: 'rejected',
      presidentNote: president ? (note || null) : order.presidentNote,
      adminNote: requireAdmin(adminUser) ? (note || null) : order.adminNote,
    },
  })
  return NextResponse.json(updated)
}
