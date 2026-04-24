import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, requireSuperAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireSuperAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const id = parseInt(params.id)
  const { name, email, password, role, permissions } = await req.json()

  if (!name || !email) return NextResponse.json({ error: 'Ad ve e-posta zorunludur' }, { status: 400 })

  const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } })
  if (existing) return NextResponse.json({ error: 'Bu e-posta başka bir kullanıcıya ait' }, { status: 409 })

  const data: Record<string, unknown> = {
    name, email,
    role: role || 'editor',
    permissions: JSON.stringify(Array.isArray(permissions) ? permissions : []),
  }
  if (password && password.trim()) {
    data.password = await bcrypt.hash(password, 10)
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req)
  if (!requireSuperAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const id = parseInt(params.id)
  if (user?.id === id) return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
