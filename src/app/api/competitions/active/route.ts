import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const competition = await prisma.competition.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  if (!competition) return NextResponse.json({ competition: null })

  const now = new Date()
  const registrationOpen =
    now >= competition.registrationStart && now <= competition.registrationEnd

  return NextResponse.json({ competition, registrationOpen })
}
