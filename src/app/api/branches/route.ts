import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET() {
  const branches = await prisma.branch.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(branches)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { name, description, imageUrl, order } = await req.json()
  if (!name) return NextResponse.json({ error: 'İsim gerekli' }, { status: 400 })
  const branch = await prisma.branch.create({
    data: { name, description: description || null, imageUrl: imageUrl || null, order: order || 0 },
  })
  return NextResponse.json(branch, { status: 201 })
}
