import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!user || !['superadmin', 'moderator'].includes(user.role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { name, active, order } = await req.json()
  const award = await prisma.awardType.update({
    where: { id: parseInt(params.id) },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(active !== undefined && { active }),
      ...(order !== undefined && { order }),
    },
  })
  return NextResponse.json(award)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!user || !['superadmin', 'moderator'].includes(user.role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  await prisma.awardType.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
