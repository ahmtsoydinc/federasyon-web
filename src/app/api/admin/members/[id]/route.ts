import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = parseInt(params.id)
  const body = await req.json()
  const data: any = {}
  if (typeof body.active === 'boolean') data.active = body.active
  if (typeof body.approved === 'boolean') data.approved = body.approved
  const member = await prisma.member.update({ where: { id }, data })
  return NextResponse.json({ id: member.id, active: member.active, approved: member.approved })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = parseInt(params.id)

  try {
    // İlişkili kayıtları önce temizle (foreign key kısıtlamaları)
    await prisma.memberMessage.deleteMany({ where: { memberId: id } })
    await prisma.passwordResetToken.deleteMany({ where: { memberId: id } })
    await prisma.braceletOrder.deleteMany({ where: { memberId: id } })
    // CompetitionAnimal'ları sil (önce collectionGroup bağını kaldır)
    await prisma.competitionAnimal.updateMany({ where: { memberId: id }, data: { collectionGroupId: null } })
    await prisma.collectionGroup.deleteMany({ where: { memberId: id } })
    await prisma.competitionAnimal.deleteMany({ where: { memberId: id } })
    // Üyeyi sil
    await prisma.member.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Member delete error:', e)
    return NextResponse.json({ error: 'Silme işlemi başarısız: ' + (e?.message || 'Bilinmeyen hata') }, { status: 500 })
  }
}
