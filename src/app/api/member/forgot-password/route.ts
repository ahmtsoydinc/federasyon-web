import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 })

    const member = await prisma.member.findUnique({ where: { email: email.toLowerCase() } })

    // Güvenlik: üye yoksa bile başarılı yanıt dön (e-posta açıklaması engelle)
    if (!member) {
      return NextResponse.json({ ok: true })
    }

    // Eski kullanılmamış tokenları geçersiz kıl
    await prisma.passwordResetToken.updateMany({
      where: { memberId: member.id, used: false },
      data: { used: true },
    })

    // Yeni token oluştur (1 saat geçerli)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 saat

    await prisma.passwordResetToken.create({
      data: { memberId: member.id, token, expiresAt },
    })

    // E-posta gönder
    await sendPasswordResetEmail(member.email, member.name, token)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
