export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Hakkımızda' }

export default async function HakkimizdaPage() {
  const page = await prisma.page.findUnique({ where: { slug: 'hakkimizda' } })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">{page?.title || 'Hakkımızda'}</h1>

      {page ? (
        <div className="prose prose-green max-w-none text-gray-700 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6 text-gray-600 leading-relaxed">
          <p>
            <strong>Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu (TSHF)</strong>, ülkemizde
            süs tavukçuluğu ve bahçe hayvanları yetiştiriciliğinin geliştirilmesi amacıyla kurulmuştur.
          </p>
          <p>
            Federasyonumuz bünyesinde il ve ilçe derneklerini bir araya getirerek, sektörün ortak
            sorunlarına çözüm üretmek, yetiştirici haklarını korumak ve sektörü ulusal ve uluslararası
            platformlarda temsil etmek amacıyla faaliyet göstermektedir.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-primary-50 rounded-xl p-5">
              <h3 className="font-bold text-primary-700 mb-2">Misyonumuz</h3>
              <p className="text-sm">
                Süs tavukları ve bahçe hayvanları yetiştiricilerinin haklarını korumak,
                sektörün gelişimine katkıda bulunmak ve bu alanda bilinç düzeyini artırmak.
              </p>
            </div>
            <div className="bg-gold-400/10 rounded-xl p-5">
              <h3 className="font-bold text-yellow-700 mb-2">Vizyonumuz</h3>
              <p className="text-sm">
                Türkiye'de süs tavukçuluğu ve bahçe hayvanları sektörünün uluslararası
                standartlara ulaşmasını sağlamak.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
