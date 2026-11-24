import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
export async function GET() {
  const competitions = await prisma.competition.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: { regulationDocument: { select: { id: true, title: true, fileUrl: true } } },
  })
  const now = new Date()
  const result = competitions.map(c => ({
    ...c,
    registrationOpen: c.isActive,
  }))
  return NextResponse.json({ competitions: result })
}
