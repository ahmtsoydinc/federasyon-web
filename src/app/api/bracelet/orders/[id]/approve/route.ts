import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'
import { getPresidentFromRequest } from '@/lib/memberAuth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const { note } = await req.json().catch(() => ({ note: '' }))

  // Başkan onayı: pending → assoc_approved
  const president = getPresidentFromRequest(req)
  if (president) {
    const order = await prisma.braceletOrder.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    if (order.associationId !== president.associationId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    if (order.status !== 'pending') return NextResponse.json({ error: 'Bu sipariş zaten işleme alınmış' }, { status: 400 })

    const updated = await prisma.braceletOrder.update({
      where: { id },
      data: { status: 'assoc_approved', presidentNote: note || null, presidentAt: new Date() },
    })
    return NextResponse.json(updated)
  }

  // Federasyon onayı: assoc_approved → fed_approved
  const adminUser = getTokenFromRequest(req)
  if (requireAdmin(adminUser)) {
    const order = await prisma.braceletOrder.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    if (order.status !== 'assoc_approved') return NextResponse.json({ error: 'Önce dernek başkanı onaylamalı' }, { status: 400 })

    const updated = await prisma.braceletOrder.update({
      where: { id },
      data: { status: 'fed_approved', adminNote: note || null, adminAt: new Date() },
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
}
