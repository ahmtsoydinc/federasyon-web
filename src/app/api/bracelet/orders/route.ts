import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMemberFromRequest } from '@/lib/memberAuth'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'
import { getPresidentFromRequest } from '@/lib/memberAuth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // Admin tüm siparişleri görebilir
  const adminUser = getTokenFromRequest(req)
  if (requireAdmin(adminUser)) {
    const status = searchParams.get('status')
    const orders = await prisma.braceletOrder.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: { member: { select: { name: true, email: true } }, association: { select: { name: true } } },
    })
    return NextResponse.json(orders)
  }

  // Başkan sadece kendi derneğinin siparişlerini görür
  const president = getPresidentFromRequest(req)
  if (president) {
    const orders = await prisma.braceletOrder.findMany({
      where: { associationId: president.associationId, status: { in: ['pending', 'assoc_approved', 'fed_approved', 'rejected'] } },
      orderBy: { createdAt: 'desc' },
      include: { member: { select: { name: true, email: true } } },
    })
    return NextResponse.json(orders)
  }

  // Üye sadece kendi siparişlerini görür
  const member = getMemberFromRequest(req)
  if (member) {
    const orders = await prisma.braceletOrder.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' },
      include: { association: { select: { name: true } } },
    })
    return NextResponse.json(orders)
  }

  return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  const member = getMemberFromRequest(req)
  if (!member) return NextResponse.json({ error: 'Üye girişi gerekli' }, { status: 401 })

  // Bireysel üye kontrolü
  const assoc = await prisma.association.findUnique({ where: { id: member.associationId } })
  if (assoc?.isBireysel) {
    return NextResponse.json({ error: 'BÜNYEMİZDE BULUNAN DERNEKLERE ÜYE OLUNMASI GEREKMEKTEDİR.' }, { status: 403 })
  }

  const { braceletNumber, quantity } = await req.json()

  if (!braceletNumber) return NextResponse.json({ error: 'Bilezik numarası zorunlu' }, { status: 400 })
  if (!quantity || quantity < 25 || quantity % 25 !== 0) {
    return NextResponse.json({ error: 'Adet 25\'in katı olmalı (min 25)' }, { status: 400 })
  }

  const priceRecord = await prisma.braceletPrice.findFirst({ orderBy: { updatedAt: 'desc' } })
  if (!priceRecord || priceRecord.pricePerUnit <= 0) {
    return NextResponse.json({ error: 'Bilezik fiyatı henüz belirlenmemiş. Lütfen daha sonra tekrar deneyin.' }, { status: 400 })
  }

  const units = quantity / 25
  const totalAmount = priceRecord.pricePerUnit * units

  const order = await prisma.braceletOrder.create({
    data: {
      memberId: member.id,
      associationId: member.associationId,
      braceletNumber: String(braceletNumber),
      quantity: Number(quantity),
      pricePerUnit: priceRecord.pricePerUnit,
      totalAmount,
      status: 'pending',
    },
    include: { association: { select: { name: true } } },
  })

  return NextResponse.json(order, { status: 201 })
}
