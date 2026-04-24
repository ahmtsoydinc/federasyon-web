import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signMemberToken } from '@/lib/memberAuth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 })

  const member = await prisma.member.findUnique({ where: { email }, include: { association: true } })
  if (!member) return NextResponse.json({ error: 'Geçersiz kimlik bilgileri' }, { status: 401 })

  const valid = await bcrypt.compare(password, member.password)
  if (!valid) return NextResponse.json({ error: 'Geçersiz kimlik bilgileri' }, { status: 401 })

  if (!member.active) return NextResponse.json({ error: 'Hesabınız pasif durumda' }, { status: 403 })

  const token = signMemberToken({ id: member.id, email: member.email, name: member.name, associationId: member.associationId })

  const res = NextResponse.json({
    member: { id: member.id, name: member.name, email: member.email, association: member.association.name }
  })

  res.cookies.set('member_token', token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
  })

  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('member_token')
  return res
}
