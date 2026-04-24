import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { PrismaClient } = require('../generated/prisma/index.js')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@tstbhf.org.tr' } })
  if (!existing) {
    const hashed = await bcrypt.hash('Admin123!', 10)
    await prisma.user.create({
      data: {
        name: 'Sistem Yöneticisi',
        email: 'admin@tstbhf.org.tr',
        password: hashed,
        role: 'superadmin',
      },
    })
    console.log('✓ Admin kullanıcı oluşturuldu: admin@tstbhf.org.tr / Admin123!')
  } else {
    console.log('✓ Admin kullanıcı zaten mevcut')
  }

  const cats = ['Haberler', 'Duyurular', 'Etkinlikler', 'Basın']
  for (const name of cats) {
    const slug = name.toLowerCase()
      .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c')
      .replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ğ/g, 'g')
    await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } })
  }
  console.log('✓ Kategoriler oluşturuldu')

  await prisma.page.upsert({
    where: { slug: 'hakkimizda' },
    update: {},
    create: {
      title: 'Hakkımızda',
      slug: 'hakkimizda',
      content: 'Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu hakkında bilgi.',
    },
  })
  console.log('✓ Örnek sayfa oluşturuldu')
  console.log('\n✅ Seed tamamlandı!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
