import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'

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
