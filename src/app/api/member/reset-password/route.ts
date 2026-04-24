import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token ve şifre gerekli' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı' }, { status: 400 })
    }

    // Token'ı bul ve doğrula
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { member: true },
    })

    if (!resetToken) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş link' }, { status: 400 })
    }
    if (resetToken.used) {
      return NextResponse.json({ error: 'Bu link daha önce kullanılmış' }, { status: 400 })
    }
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Link süresi dolmuş. Yeni bir sıfırlama talebi oluşturun' }, { status: 400 })
    }

    // Şifreyi güncelle
    const hashed = await bcrypt.hash(password, 10)
    await prisma.member.update({
      where: { id: resetToken.memberId },
      data: { password: hashed },
    })

    // Token'ı kullanılmış olarak işaretle
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
