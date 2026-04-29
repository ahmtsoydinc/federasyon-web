'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

// Her menü öğesinin hangi "permission key" ile korunduğu
const menuGroups = [
  {
    label: 'İçerik',
    items: [
      { icon: '🏠', label: 'Dashboard', href: '/admin', perm: null },
      { icon: '📰', label: 'Haberler', href: '/admin/haberler', perm: 'haberler' },
      { icon: '📢', label: 'Duyurular', href: '/admin/duyurular', perm: 'duyurular' },
      { icon: '📂', label: 'Belgeler', href: '/admin/belgeler', perm: 'belgeler' },
      { icon: '🖼', label: 'Slider', href: '/admin/slider', perm: 'slider' },
      { icon: '📄', label: 'Sayfalar', href: '/admin/sayfalar', perm: 'sayfalar' },
      { icon: '🏛', label: 'Yönetim Kadrosu', href: '/admin/yonetim', perm: 'yonetim' },
      { icon: '🌿', label: 'Branşlar', href: '/admin/branslar', perm: 'branslar' },
    ],
  },
  {
    label: 'Üyelik & Bilezik',
    items: [
      { icon: '🏢', label: 'Dernekler', href: '/admin/dernekler', perm: 'dernekler' },
      { icon: '👥', label: 'Üyeler', href: '/admin/uyeler', perm: 'uyeler' },
      { icon: '💎', label: 'Bilezik Siparişleri', href: '/admin/bilezik-siparisler', perm: 'bilezik' },
      { icon: '💰', label: 'Bilezik Fiyatı', href: '/admin/bilezik-fiyati', perm: 'bilezik' },
      { icon: '✉️', label: 'Mesaj Gönder', href: '/admin/mesaj-gonder', perm: 'mesaj' },
    ],
  },
  {
    label: 'Yarışma',
    items: [
      { icon: '🏅', label: 'Yarışmalar', href: '/admin/yarismalar', perm: 'yarisma' },
      { icon: '🎖', label: 'Ödül Türleri', href: '/admin/oduller', perm: 'yarisma' },
      { icon: '📊', label: 'Hayvan Standartları', href: '/admin/hayvan-standartlari', perm: 'yarisma' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { icon: '👤', label: 'Kullanıcılar', href: '/admin/kullanicilar', perm: 'superadmin' },
      { icon: '🏆', label: 'Sponsorlar', href: '/admin/sponsorlar', perm: 'sponsorlar' },
      { icon: '🗂', label: 'Menü Yönetimi', href: '/admin/menu', perm: 'menu' },
      { icon: '📱', label: 'Sosyal Medya', href: '/admin/site-ayarlari', perm: 'site-ayarlari' },
    ],
  },
]

interface UserInfo { name: string; role: string; permissions: string[] }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === '/admin/giris'

  useEffect(() => {
    if (isLoginPage) { setChecked(true); return }
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser({ ...data.user, permissions: data.user.permissions || [] })
        else router.push('/admin/giris')
      })
      .catch(() => router.push('/admin/giris'))
      .finally(() => setChecked(true))
  }, [isLoginPage])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/giris')
  }

  const canAccess = (perm: string | null) => {
    if (!user) return false
    if (user.role === 'superadmin') return true
    if (user.role === 'moderator') return perm !== 'superadmin'
    if (perm === null) return true           // Dashboard → herkes
    if (perm === 'superadmin') return false  // Kullanıcılar → sadece superadmin
    return user.permissions.includes(perm)
  }

  if (isLoginPage) return <>{children}</>

  if (!checked || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:flex`}
      >
        <div className="px-4 py-4 border-b border-primary-700">
          <img src="/tshf-logo.png" alt="TSHF Logo" className="h-12 w-auto object-contain" />
          <div className="text-primary-300 text-xs mt-1">Admin Panel</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter(item => canAccess(item.perm))
            if (visibleItems.length === 0) return null
            return (
              <div key={group.label}>
                <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider px-3 mb-1">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          active ? 'bg-white/20 text-white' : 'text-primary-200 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-primary-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user.name[0]}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{user.name}</div>
              <div className="text-xs text-primary-300">
                {({ superadmin: '👑 Süper Admin', moderator: '🔧 Moderatör', hakem: '⚖️ Hakem', president: '🏛 Başkan', editor: '✏️ Editör' } as Record<string,string>)[user.role] ?? '✏️ Editör'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-center text-xs text-primary-300 hover:text-white py-1.5 rounded hover:bg-white/10 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-md text-gray-500" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <Link href="/" target="_blank" className="text-sm text-gray-500 hover:text-primary-600">
            Siteyi Gör ↗
          </Link>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
