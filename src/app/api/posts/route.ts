import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/slugify'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const admin = searchParams.get('admin') === '1'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  const where = admin ? {} : { published: true }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { category: true },
    }),
    prisma.post.count({ where }),
  ])

  return NextResponse.json({ posts, total, page, limit, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const body = await req.json()
  const { title, content, excerpt, imageUrl, categoryId, published, featured } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'Başlık ve içerik gerekli' }, { status: 400 })
  }

  let slug = slugify(title)
  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      imageUrl: imageUrl || null,
      categoryId: categoryId ? Number(categoryId) : null,
      published: published ?? false,
      featured: featured ?? false,
    },
    include: { category: true },
  })

  return NextResponse.json(post, { status: 201 })
}
