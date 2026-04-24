import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireSuperAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireSuperAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireSuperAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { name, email, password, role, associationId } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const newUser = await prisma.user.create({
    data: {
      name, email, password: hashed,
      role: role || 'editor',
      permissions: '[]',
      associationId: associationId ? Number(associationId) : null,
    },
    select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
  })
  return NextResponse.json(newUser, { status: 201 })
}
