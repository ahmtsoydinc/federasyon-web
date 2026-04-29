'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface MemberInfo { name: string; email: string; association: { name: string } }

const navItems = [
  { icon: '🏠', label: 'Ana Sayfa', href: '/uye/dashboard' },
  { icon: '💎', label: 'Bilezik Siparişi', href: '/uye/bilezik-siparis' },
  { icon: '📋', label: 'Siparişlerim', href: '/uye/siparislerim' },
  { icon: '🏅', label: 'Yarışma Kaydı', href: '/uye/yarisma-kayit' },
  { icon: '✉️', label: 'Mesajlar', href: '/uye/mesajlar' },
]

export default function UyeLayout({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<MemberInfo | null>(null)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetch('/api/member/me')
      .then(r => r.json())
      .then(d => { if (d.member) setMember(d.member); else router.push('/uye-girisi') })
      .catch(() => router.push('/uye-girisi'))
      .finally(() => setLoading(false))

    // Okunmamış mesaj sayısı
    fetch('/api/messages')
      .then(r => r.json())
      .then((msgs: any[]) => setUnread(msgs.filter(m => !m.read).length))
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/member/login', { method: 'DELETE' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (!member) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst bar */}
      <div className="bg-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
              {member.name[0]}
            </div>
            <div className="min-w-0">
              <span className="font-medium text-sm truncate block max-w-[140px] sm:max-w-none">{member.name}</span>
              <span className="text-primary-300 text-xs truncate block max-w-[140px] sm:max-w-none">{member.association.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="text-xs text-primary-200 hover:text-white hidden sm:block">Ana Site</Link>
            <button onClick={handleLogout} className="text-xs text-primary-200 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg">Çıkış</button>
          </div>
        </div>
      </div>

      {/* Nav — yatay scroll */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <nav className="flex overflow-x-auto">
            {navItems.map(item => (
              <Link
                key={item.href} href={item.href}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex-shrink-0 ${
                  pathname === item.href
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-600 hover:text-primary-600'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden xs:inline sm:inline">{item.label}</span>
                {item.href === '/uye/mesajlar' && unread > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {unread}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* İçerik */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {children}
      </div>
    </div>
  )
}
