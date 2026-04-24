import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(documents)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { title, fileUrl, category } = await req.json()
  if (!title || !fileUrl) return NextResponse.json({ error: 'Başlık ve dosya URL gerekli' }, { status: 400 })

  const doc = await prisma.document.create({
    data: { title, fileUrl, category: category || null },
  })
  return NextResponse.json(doc, { status: 201 })
}
