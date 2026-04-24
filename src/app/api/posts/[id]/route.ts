import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/slugify'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const post = await prisma.post.findUnique({ where: { id }, include: { category: true } })
  if (!post) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const id = parseInt(params.id)
  const body = await req.json()
  const { title, content, excerpt, imageUrl, categoryId, published, featured } = body

  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  let slug = existing.slug
  if (title && title !== existing.title) {
    slug = slugify(title)
    const conflict = await prisma.post.findFirst({ where: { slug, NOT: { id } } })
    if (conflict) slug = `${slug}-${Date.now()}`
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      slug,
      content: content ?? existing.content,
      excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
      imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
      categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : existing.categoryId,
      published: published !== undefined ? published : existing.published,
      featured: featured !== undefined ? featured : existing.featured,
    },
    include: { category: true },
  })

  return NextResponse.json(post)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const id = parseInt(params.id)
  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
