import { PrismaClient } from '../generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import path from 'path'

const adapter = new PrismaLibSql({ url: `file:${path.join(process.cwd(), 'prisma', 'dev.db')}` })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Admin kullanıcı
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
  }

  // Kategoriler
  const cats = ['Haberler', 'Duyurular', 'Etkinlikler', 'Basın']
  for (const name of cats) {
    const slug = name.toLowerCase().replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c')
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
  }
  console.log('✓ Kategoriler oluşturuldu')

  // Örnek sayfa
  await prisma.page.upsert({
    where: { slug: 'hakkimizda' },
    update: {},
    create: {
      title: 'Hakkımızda',
      slug: 'hakkimizda',
      content: `
        <h2>Federasyonumuz Hakkında</h2>
        <p>Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu, ülkemizde süs tavukçuluğu ve bahçe hayvanları yetiştiriciliğinin geliştirilmesi amacıyla kurulmuştur.</p>
        <p>Federasyonumuz bünyesinde il ve ilçe derneklerini bir araya getirerek, sektörün ortak sorunlarına çözüm üretmek, yetiştirici haklarını korumak ve sektörü ulusal ve uluslararası platformlarda temsil etmek amacıyla faaliyet göstermektedir.</p>
        <h3>Misyonumuz</h3>
        <p>Süs tavukları ve bahçe hayvanları yetiştiricilerinin haklarını korumak, sektörün gelişimine katkıda bulunmak ve bu alanda bilinç düzeyini artırmak.</p>
        <h3>Vizyonumuz</h3>
        <p>Türkiye'de süs tavukçuluğu ve bahçe hayvanları sektörünün uluslararası standartlara ulaşmasını sağlamak.</p>
      `,
    },
  })
  console.log('✓ Örnek sayfa oluşturuldu')

  console.log('\n✅ Seed tamamlandı!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
