import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/slugify'

export async function GET() {
  const pages = await prisma.page.findMany({ orderBy: { title: 'asc' } })
  return NextResponse.json(pages)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { title, content, pdfUrl } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'Başlık ve içerik zorunlu' }, { status: 400 })

  let slug = slugify(title)
  const exists = await prisma.page.findUnique({ where: { slug } })
  if (exists) slug = `${slug}-${Date.now()}`

  const page = await prisma.page.create({ data: { title, slug, content, pdfUrl: pdfUrl || null } })
  return NextResponse.json(page, { status: 201 })
}
