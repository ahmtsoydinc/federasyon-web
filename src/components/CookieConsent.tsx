'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem('cookie_consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl border border-white/10 px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* İkon */}
        <div className="text-2xl flex-shrink-0">🍪</div>

        {/* Metin */}
        <div className="flex-1 text-sm text-gray-300 leading-relaxed">
          Bu site, daha iyi bir deneyim sunmak ve reklam hizmetleri için çerezler kullanmaktadır.
          Devam ederek{' '}
          <Link href="/gizlilik-politikasi" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
            Gizlilik Politikamızı
          </Link>{' '}
          kabul etmiş sayılırsınız.
        </div>

        {/* Butonlar */}
        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={reject}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-white/20 text-sm text-gray-400 hover:text-white hover:border-white/40 transition-colors"
          >
            Reddet
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-primary-900 font-semibold text-sm transition-colors"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  )
}
