import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import HeroSlider from '@/components/HeroSlider'
import SponsorMarquee from '@/components/SponsorMarquee'

export const revalidate = 0

async function getData() {
  const [posts, announcements, sponsors, socialRaw, sliders] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { category: true },
    }),
    prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.sponsor.findMany({
      where: { active: true },
      orderBy: [{ isMain: 'desc' }, { order: 'asc' }],
    }),
    prisma.siteSettings.findMany({
      where: { key: { in: ['instagram_url', 'facebook_url', 'youtube_url', 'youtube_video_id', 'facebook_page_id', 'slider_interval'] } },
    }),
    prisma.slider.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    }),
  ])

  const social: Record<string, string> = {}
  for (const s of socialRaw) social[s.key] = s.value

  return { posts, announcements, sponsors, social, sliders }
}

export default async function HomePage() {
  const { posts, announcements, sponsors, social, sliders } = await getData()

  const mainSponsor = sponsors.find(s => s.isMain)
  const otherSponsors = sponsors.filter(s => !s.isMain)
  const hasSponsors = sponsors.length > 0

  const hasSocial = !!(social.instagram_url || social.facebook_url || social.youtube_url || social.youtube_video_id)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-block bg-gold-500 text-primary-900 text-xs font-bold px-3 py-1 rounded-full mb-4 sm:mb-6 uppercase tracking-wider">
              Resmi Web Sitesi
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
              Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed">
              Süs tavukları ve bahçe hayvanları sektörünün ulusal çatı örgütü olarak
              üyelerimizi temsil etmek, sektörü geliştirmek ve korumak için çalışıyoruz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/hakkimizda"
                className="bg-white text-primary-700 font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-primary-50 transition-colors text-sm sm:text-base"
              >
                Bizi Tanıyın
              </Link>
              <Link
                href="/iletisim"
                className="border-2 border-white text-white font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                İletişime Geçin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Girişleri */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/uye-girisi"
              className="flex items-center gap-2.5 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-800 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
              <span className="text-lg">👤</span> Üye Girişi
            </Link>
            <Link href="/hakem/giris"
              className="flex items-center gap-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
              <span className="text-lg">⚖️</span> Hakem Girişi
            </Link>
            <Link href="/baskan/giris"
              className="flex items-center gap-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
              <span className="text-lg">🏛️</span> Dernek Başkanı
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Slider */}
      {sliders.length > 0 && (
        <HeroSlider
          slides={sliders}
          interval={social.slider_interval ? Number(social.slider_interval) * 1000 : 5000}
        />
      )}

      {/* İstatistikler */}
      <section className="bg-primary-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: '50+', label: 'Üye Dernek' },
              { value: '10+', label: 'Yıl Deneyim' },
              { value: '81', label: 'İl Temsil' },
              { value: '1000+', label: 'Yetiştiricı' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-gold-400">{stat.value}</div>
                <div className="text-sm text-white/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ana Sponsor Banner */}
      {mainSponsor && (
        <section className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-10 sm:py-14">
          {/* Parlama efekti */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.25)_0%,_transparent_70%)]" />
          <div className="relative max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-black/10 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-5">
              <span>⭐</span> Platinum Sponsor <span>⭐</span>
            </div>
            {mainSponsor.websiteUrl ? (
              <a href={mainSponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl px-8 py-6 sm:px-16 sm:py-8 inline-block group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300">
                  {mainSponsor.logoUrl ? (
                    <img src={mainSponsor.logoUrl} alt={mainSponsor.name} className="h-20 sm:h-28 w-auto object-contain mx-auto" />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors">{mainSponsor.name}</span>
                  )}
                </div>
                <div className="mt-4 text-amber-900/70 text-sm font-medium group-hover:text-amber-900 transition-colors">
                  {mainSponsor.websiteUrl} ↗
                </div>
              </a>
            ) : (
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl px-8 py-6 sm:px-16 sm:py-8 inline-block">
                {mainSponsor.logoUrl ? (
                  <img src={mainSponsor.logoUrl} alt={mainSponsor.name} className="h-20 sm:h-28 w-auto object-contain mx-auto" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-gray-800">{mainSponsor.name}</span>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Ana içerik */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Haberler */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Son Haberler</h2>
              <Link href="/haberler" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Tümünü Gör →
              </Link>
            </div>

            {posts.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                Henüz haber eklenmemiş.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <Link key={post.id} href={`/haberler/${post.slug}`}>
                    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group">
                      {post.imageUrl ? (
                        <div className="h-44 overflow-hidden">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                          <span className="text-4xl">🐓</span>
                        </div>
                      )}
                      <div className="p-4">
                        {post.category && (
                          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                            {post.category.name}
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-800 mt-2 mb-1 line-clamp-2 group-hover:text-primary-700">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                        )}
                        <div className="text-xs text-gray-400 mt-3">
                          {new Date(post.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Duyurular sidebar */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Duyurular</h2>
              <Link href="/duyurular" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Tümü →
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-sm">
                  Duyuru bulunmuyor.
                </div>
              ) : (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      ann.important
                        ? 'bg-red-50 border-red-500'
                        : 'bg-primary-50 border-primary-500'
                    }`}
                  >
                    {ann.important && (
                      <span className="text-xs font-bold text-red-600 uppercase">⚠ Önemli</span>
                    )}
                    <h4 className="font-semibold text-gray-800 text-sm mt-1">{ann.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ann.content}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(ann.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Hızlı linkler */}
            <div className="mt-8 bg-primary-700 rounded-xl p-5 text-white">
              <h3 className="font-semibold mb-3">Hızlı Erişim</h3>
              <ul className="space-y-2">
                {[
                  ['📄 Belgeler', '/belgeler'],
                  ['🏛 Yönetim Kurulu', '/yonetim'],
                  ['🌿 Branşlar', '/branslar'],
                  ['⚖️ Hakem Girişi', '/hakem/giris'],
                  ['📞 İletişim', '/iletisim'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-white/80 hover:text-white flex items-center gap-2">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sosyal medya linkler (sidebar) */}
            {(social.instagram_url || social.facebook_url || social.youtube_url) && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Bizi Takip Edin</h3>
                <div className="flex gap-3">
                  {social.instagram_url && (
                    <a href={social.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white hover:scale-110 transition-transform shadow-sm"
                      title="Instagram">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {social.facebook_url && (
                    <a href={social.facebook_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white hover:scale-110 transition-transform shadow-sm"
                      title="Facebook">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {social.youtube_url && (
                    <a href={social.youtube_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white hover:scale-110 transition-transform shadow-sm"
                      title="YouTube">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sosyal Medya Bölümü — tam genişlik */}
      {hasSocial && (
        <section className="bg-gray-900 py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-6 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Sosyal Medyamızda Bizi Takip Edin</h2>
              <p className="text-gray-400 text-sm">Güncel içeriklerimiz için sosyal medya kanallarımızı takip edin</p>
            </div>

            <div className={`grid gap-4 sm:gap-6 ${social.youtube_video_id ? 'lg:grid-cols-3' : 'lg:grid-cols-2 max-w-2xl mx-auto'}`}>

              {/* YouTube Video Embed */}
              {social.youtube_video_id && (
                <div className="lg:col-span-2">
                  <div className="bg-gray-800 rounded-2xl overflow-hidden">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${social.youtube_video_id}?rel=0&modestbranding=1`}
                        title="TSHF YouTube"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                    {social.youtube_url && (
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
                            </svg>
                          </div>
                          <span className="text-white text-sm font-medium">YouTube Kanalımız</span>
                        </div>
                        <a href={social.youtube_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-full hover:bg-red-700 transition-colors font-medium">
                          Abone Ol
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Instagram + Facebook Cards */}
              <div className="flex flex-col gap-4">
                {social.instagram_url && (
                  <a href={social.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="group flex-1 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-white hover:scale-[1.02] transition-transform min-h-[140px]">
                    <svg className="w-10 h-10 mb-3 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <div className="font-bold text-lg">Instagram</div>
                    <div className="text-white/80 text-sm mt-1">Fotoğraf ve hikayelerimiz için takip edin</div>
                    <div className="mt-3 text-xs bg-white/20 px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">Profili Ziyaret Et →</div>
                  </a>
                )}

                {social.facebook_url && (
                  <a href={social.facebook_url} target="_blank" rel="noopener noreferrer"
                    className="group flex-1 bg-blue-600 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-white hover:scale-[1.02] transition-transform min-h-[140px] hover:bg-blue-700">
                    <svg className="w-10 h-10 mb-3 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <div className="font-bold text-lg">Facebook</div>
                    <div className="text-white/80 text-sm mt-1">Sayfamızı beğenin ve güncel kalın</div>
                    <div className="mt-3 text-xs bg-white/20 px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">Sayfayı Ziyaret Et →</div>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Irk Standartları */}
      <section className="bg-gray-50 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Irk Standartları</h2>
            <p className="text-gray-500 text-sm">Irk ve renk standartları için ilgili bölüme tıklayınız</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {[
              { emoji: '📋', name: 'Terminoloji ve\nGenel Listeler',  bg: 'from-slate-50 to-gray-100',    iconBg: 'bg-slate-100',   href: 'https://tshfedstandartlar.com/' },
              { emoji: '🐓', name: 'Dev Irk Tavuk\nStandartları',     bg: 'from-red-50 to-rose-50',       iconBg: 'bg-red-100',     href: 'https://tshfedstandartlar.com/Dev.php' },
              { emoji: '🐤', name: 'Cüce Tavuk\nStandartları',        bg: 'from-yellow-50 to-amber-50',   iconBg: 'bg-yellow-100',  href: 'https://tshfedstandartlar.com/Cuce.php' },
              { emoji: '🪿', name: 'Kaz\nStandartları',               bg: 'from-green-50 to-emerald-50',  iconBg: 'bg-green-100',   href: 'https://tshfedstandartlar.com/Kaz.php' },
              { emoji: '🦆', name: 'Ördek\nStandartları',             bg: 'from-blue-50 to-cyan-50',      iconBg: 'bg-blue-100',    href: 'https://tshfedstandartlar.com/Ordek.php' },
              { emoji: '🦃', name: 'Hindi\nStandartları',             bg: 'from-orange-50 to-amber-50',   iconBg: 'bg-orange-100',  href: 'https://tshfedstandartlar.com/Hindi.php' },
              { emoji: '🐦', name: 'Beç\nTavukları',                  bg: 'from-purple-50 to-violet-50',  iconBg: 'bg-purple-100',  href: 'https://tshfedstandartlar.com/Bec.php' },
              { emoji: '🇹🇷', name: 'Yerli Irkları\nTaslaklar',       bg: 'from-red-50 to-orange-50',     iconBg: 'bg-red-100',     href: 'https://tshfedstandartlar.com/Yerli.php' },
            ].map((b) => (
              <a
                key={b.name}
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group bg-gradient-to-br ${b.bg} rounded-2xl border border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 p-4 sm:p-5 flex flex-col items-center text-center gap-3`}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${b.iconBg} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm`}>
                  {b.emoji}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm group-hover:text-primary-700 transition-colors whitespace-pre-line leading-snug">{b.name}</div>
                  <div className="text-xs text-primary-600 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">Standartları Gör →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorlar */}
      {otherSponsors.length > 0 && (
        <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
                <span className="w-8 h-px bg-amber-400/50 inline-block" />
                Değerli Destekçilerimiz
                <span className="w-8 h-px bg-amber-400/50 inline-block" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Sponsorlarımız</h2>
              <p className="text-gray-400 text-sm mt-2">Federasyonumuza destek veren kurum ve kuruluşlar</p>
            </div>
            <SponsorMarquee sponsors={otherSponsors} />
          </div>
        </section>
      )}
    </div>
  )
}
