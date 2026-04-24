import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all') === '1'
  const sponsors = await prisma.sponsor.findMany({
    where: all ? undefined : { active: true },
    orderBy: [{ isMain: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(sponsors)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const sponsor = await prisma.sponsor.create({
    data: {
      name: data.name,
      logoUrl: data.logoUrl || null,
      websiteUrl: data.websiteUrl || null,
      isMain: data.isMain ?? false,
      order: data.order ?? 0,
      active: true,
    },
  })
  return NextResponse.json(sponsor)
}
