import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.standardCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      standards: {
        orderBy: { order: 'asc' },
        include: {
          images: { orderBy: { order: 'asc' } },
        },
      },
    },
  })
  return NextResponse.json(categories)
}
