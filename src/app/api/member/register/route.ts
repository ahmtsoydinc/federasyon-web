import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

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
    await prisma.member.create({
      data: {
        name, email, password: hashed,
        phone: phone || null,
        associationId: Number(associationId),
        approved: false,
      },
    })

    return NextResponse.json(
      { pending: true, message: 'Başvurunuz alındı. Dernek başkanınız onayladıktan sonra giriş yapabilirsiniz.' },
      { status: 201 }
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
