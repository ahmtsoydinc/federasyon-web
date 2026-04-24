import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signPresidentToken } from '@/lib/memberAuth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email }, include: { association: true } })
  if (!user || user.role !== 'president') {
    return NextResponse.json({ error: 'Geçersiz kimlik bilgileri' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return NextResponse.json({ error: 'Geçersiz kimlik bilgileri' }, { status: 401 })

  if (!user.associationId) return NextResponse.json({ error: 'Dernek tanımlanmamış' }, { status: 400 })

  const token = signPresidentToken({
    id: user.id, email: user.email, name: user.name,
    associationId: user.associationId, role: 'president',
  })

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, association: user.association?.name }
  })

  res.cookies.set('president_token', token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
  })

  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('president_token')
  return res
}
