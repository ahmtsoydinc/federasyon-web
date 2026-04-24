import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const board = searchParams.get('board')
  const members = await prisma.boardMember.findMany({
    where: board ? { board } : {},
    orderBy: [{ board: 'asc' }, { order: 'asc' }],
  })
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { name, title, imageUrl, board, order } = await req.json()
  if (!name || !title || !board) return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })

  const member = await prisma.boardMember.create({
    data: { name, title, imageUrl: imageUrl || null, board, order: order || 0 },
  })
  return NextResponse.json(member, { status: 201 })
}
