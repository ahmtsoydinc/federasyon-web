import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signHakemToken } from '@/lib/hakemAuth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email ve şifre zorunlu' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== 'hakem') return NextResponse.json({ error: 'Geçersiz kimlik bilgileri' }, { status: 401 })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return NextResponse.json({ error: 'Geçersiz kimlik bilgileri' }, { status: 401 })

  const token = signHakemToken({ id: user.id, email: user.email, name: user.name, role: 'hakem' })

  const res = NextResponse.json({ ok: true, name: user.name })
  res.cookies.set('hakem_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12,
    path: '/',
  })
  return res
}
