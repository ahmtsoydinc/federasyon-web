import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPresidentFromRequest } from '@/lib/memberAuth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const president = getPresidentFromRequest(req)
  if (!president) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = parseInt(params.id)
  const member = await prisma.member.findFirst({ where: { id, associationId: president.associationId } })
  if (!member) return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 })
  const updated = await prisma.member.update({ where: { id }, data: { approved: true } })
  return NextResponse.json({ id: updated.id, approved: updated.approved })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const president = getPresidentFromRequest(req)
  if (!president) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = parseInt(params.id)
  const { reason } = await req.json()
  if (!reason || reason.trim().length < 3) {
    return NextResponse.json({ error: 'Silme nedeni en az 3 karakter olmalıdır' }, { status: 400 })
  }
  const member = await prisma.member.findFirst({ where: { id, associationId: president.associationId } })
  if (!member) return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 })
  try {
    await prisma.memberMessage.deleteMany({ where: { memberId: id } })
    await prisma.passwordResetToken.deleteMany({ where: { memberId: id } })
    await prisma.member.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('President member delete error:', e)
    return NextResponse.json({ error: 'Silme işlemi başarısız: ' + (e?.message || 'Bilinmeyen hata') }, { status: 500 })
  }
}
