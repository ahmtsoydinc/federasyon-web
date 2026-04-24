'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BaskanLayout({ children }: { children: React.ReactNode }) {
  const [president, setPresident] = useState<any>(null)
  const [checked, setChecked] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname === '/baskan/giris'

  useEffect(() => {
    if (isLogin) { setChecked(true); return }
    fetch('/api/president/me')
      .then(r => r.json())
      .then(d => { if (d.president) setPresident(d.president); else router.push('/baskan/giris') })
      .catch(() => router.push('/baskan/giris'))
      .finally(() => setChecked(true))
  }, [isLogin])

  if (isLogin) return <>{children}</>
  if (!checked || !president) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛</span>
            <div>
              <div className="font-bold text-sm">Başkan Paneli</div>
              <div className="text-xs text-primary-200">{president.name} · {president.association}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-primary-200 hover:text-white">Ana Site</Link>
            <button
              onClick={async () => { await fetch('/api/president/login', { method: 'DELETE' }); router.push('/baskan/giris') }}
              className="text-xs text-primary-200 hover:text-white"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
