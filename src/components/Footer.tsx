import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getSocialSettings() {
  const keys = ['x_url', 'instagram_url', 'facebook_url', 'youtube_url']
  const rows = await prisma.siteSettings.findMany({ where: { key: { in: keys } } })
  const result: Record<string, string> = {}
  for (const r of rows) result[r.key] = r.value
  return result
}

export default async function Footer() {
  const social = await getSocialSettings()

  const socialLinks = [
    {
      key: 'x_url',
      label: 'X',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      bg: 'bg-black hover:bg-gray-800',
    },
    {
      key: 'instagram_url',
      label: 'Instagram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      bg: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90',
    },
    {
      key: 'facebook_url',
      label: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      bg: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      key: 'youtube_url',
      label: 'YouTube',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
        </svg>
      ),
      bg: 'bg-red-600 hover:bg-red-700',
    },
  ].filter(s => !!social[s.key])

  return (
    <footer className="bg-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Hakkında */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="mb-4">
              <div className="bg-white rounded-lg p-2 inline-block">
                <img
                  src="/tshf-logo.png"
                  alt="TSHF Logo"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu olarak
              sektörü temsil etmek ve geliştirmek için çalışıyoruz.
            </p>

            {/* Sosyal Medya */}
            {socialLinks.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                  Sosyal Medyamızda Bizi Takip Edin
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {socialLinks.map(s => (
                    <a
                      key={s.key}
                      href={social[s.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-white transition-opacity ${s.bg}`}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hızlı linkler */}
          <div>
            <h3 className="font-semibold mb-4 text-gold-400">Hızlı Erişim</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                ['Hakkımızda', '/hakkimizda'],
                ['Haberler', '/haberler'],
                ['Duyurular', '/duyurular'],
                ['Belgeler', '/belgeler'],
                ['İletişim', '/iletisim'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors flex items-center gap-1.5">
                    <span className="text-primary-400">→</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="font-semibold mb-4 text-gold-400">İletişim</h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:tshf@tshf.org.tr" className="hover:text-white transition-colors">tshf@tshf.org.tr</a>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+905455488483" className="hover:text-white transition-colors">+90 545 548 84 83</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>Maltepe Mahallesi 65/1 Sokak Sivil Toplum Merkezi Güzelbahçe/İZMİR</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu</span>
          <div className="flex gap-4">
            <Link href="/gizlilik-politikasi" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
            <Link href="/uye-girisi" className="hover:text-white transition-colors">Üye Girişi</Link>
            <Link href="/baskan/giris" className="hover:text-white transition-colors">Başkan Girişi</Link>
          </div>
        </div>
        <div className="mt-3 text-center text-xs text-white/30">
          SOYDİNÇ Yazılım &amp; Tasarım tarafından yapılmıştır.
        </div>
      </div>
    </footer>
  )
}
