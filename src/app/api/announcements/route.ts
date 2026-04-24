import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ important: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(announcements)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { title, content, important } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'Başlık ve içerik gerekli' }, { status: 400 })

  const ann = await prisma.announcement.create({
    data: { title, content, important: important ?? false },
  })
  return NextResponse.json(ann, { status: 201 })
}
