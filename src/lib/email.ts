import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
  const resetLink = `${siteUrl}/sifre-sifirla?token=${token}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'TSHF <noreply@tshf.org.tr>',
    to,
    subject: 'Şifre Sıfırlama Talebi — TSHF',
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f3f4f6;margin:0;padding:0;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <!-- Üst banner -->
    <div style="background:linear-gradient(135deg,#1e5631,#2d7a46);padding:32px 40px;text-align:center;">
      <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
        <span style="color:#fff;font-size:24px;font-weight:bold;">T</span>
      </div>
      <h1 style="color:#fff;font-size:18px;margin:0;font-weight:700;">TSHF Üye Portalı</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:4px 0 0;">Türkiye Süs Hayvanları ve Bahçe Hayvanları Federasyonu</p>
    </div>

    <!-- İçerik -->
    <div style="padding:36px 40px;">
      <p style="color:#374151;font-size:15px;margin:0 0 8px;">Merhaba <strong>${name}</strong>,</p>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 28px;">
        Üye hesabınız için bir <strong>şifre sıfırlama talebi</strong> aldık.<br>
        Aşağıdaki butona tıklayarak yeni şifrenizi oluşturabilirsiniz.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="${resetLink}"
           style="display:inline-block;background:linear-gradient(135deg,#1e5631,#2d7a46);color:#fff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">
          Şifremi Sıfırla
        </a>
      </div>

      <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin:24px 0;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 6px;">Butona tıklayamıyorsanız aşağıdaki linki kopyalayın:</p>
        <p style="color:#2d7a46;font-size:12px;word-break:break-all;margin:0;">${resetLink}</p>
      </div>

      <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:24px 0 0;">
        ⏱ Bu link <strong>1 saat</strong> geçerlidir.<br>
        🔒 Bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz, hesabınız güvende.
      </p>
    </div>

    <!-- Alt kısım -->
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        © ${new Date().getFullYear()} TSHF — Tüm hakları saklıdır.<br>
        <a href="mailto:info@tshf.org.tr" style="color:#6b7280;text-decoration:none;">info@tshf.org.tr</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}
