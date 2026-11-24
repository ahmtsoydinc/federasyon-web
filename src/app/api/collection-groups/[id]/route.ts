import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from "@/lib/auth"
import { getMemberFromRequest } from '@/lib/memberAuth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { groupScore } = await req.json()
  const updated = await prisma.collectionGroup.update({
    where: { id: parseInt(params.id) },
    data: { groupScore: groupScore !== undefined ? Number(groupScore) : null },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const member = getMemberFromRequest(req)
  if (!member) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const groupId = parseInt(params.id)
  // First delete all animals in this group (handles FK constraint)
  await prisma.competitionAnimal.deleteMany({
    where: { collectionGroupId: groupId },
  })
  // Then delete the group itself
  await prisma.collectionGroup.delete({
    where: { id: groupId },
  })
  return NextResponse.json({ ok: true })
}
