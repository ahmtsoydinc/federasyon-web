'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function HakemLayout({ children }: { children: React.ReactNode }) {
  const [hakem, setHakem] = useState<{ name: string } | null>(null)
  const [checked, setChecked] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isLogin = pathname === '/hakem/giris'

  useEffect(() => {
    if (isLogin) { setChecked(true); return }
    fetch('/api/hakem/me')
      .then(r => r.json())
      .then(d => { if (d.hakem) setHakem(d.hakem); else router.push('/hakem/giris') })
      .catch(() => router.push('/hakem/giris'))
      .finally(() => setChecked(true))
  }, [isLogin])

  const handleLogout = async () => {
    await fetch('/api/hakem/logout', { method: 'POST' })
    router.push('/hakem/giris')
  }

  if (isLogin) return <>{children}</>

  if (!checked || !hakem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-800 text-white">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
              {hakem.name[0]}
            </div>
            <div>
              <div className="text-sm font-semibold">{hakem.name}</div>
              <div className="text-xs text-primary-300">Hakem Paneli</div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-xs text-primary-200 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition-colors">
            Çıkış
          </button>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  )
}
