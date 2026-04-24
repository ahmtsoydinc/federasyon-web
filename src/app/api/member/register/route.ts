import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signMemberToken } from '@/lib/memberAuth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, associationId } = await req.json()

    if (!name || !email || !password || !associationId) {
      return NextResponse.json({ error: 'Ad, e-posta, şifre ve dernek zorunludur' }, { status: 400 })
    }

    const assoc = await prisma.association.findUnique({ where: { id: Number(associationId) } })
    if (!assoc) return NextResponse.json({ error: 'Dernek bulunamadı' }, { status: 404 })

    const exists = await prisma.member.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const member = await prisma.member.create({
      data: { name, email, password: hashed, phone: phone || null, associationId: Number(associationId) },
      include: { association: true },
    })

    const token = signMemberToken({ id: member.id, email: member.email, name: member.name, associationId: member.associationId })

    const res = NextResponse.json({
      member: { id: member.id, name: member.name, email: member.email, association: assoc.name }
    }, { status: 201 })

    res.cookies.set('member_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
    })

    return res
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
