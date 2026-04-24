'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SifreUnuttumPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/member/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Bir hata oluştu'); return }
    setSent(true)
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        {sent ? (
          /* Başarı ekranı */
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">E-posta Gönderildi</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Eğer <strong>{email}</strong> adresine kayıtlı bir üyelik varsa, şifre sıfırlama linki gönderildi.
              Gelen kutunuzu ve spam klasörünüzü kontrol edin.
            </p>
            <p className="text-xs text-gray-400 mb-6">Link <strong>1 saat</strong> geçerlidir.</p>
            <Link href="/uye-girisi" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              ← Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          /* Form */
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Şifremi Unuttum</h1>
              <p className="text-sm text-gray-500 mt-1">Kayıtlı e-posta adresinizi girin, size sıfırlama linki gönderelim</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="email@ornek.com"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
              >
                {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              <Link href="/uye-girisi" className="text-primary-600 hover:text-primary-700 font-medium">
                ← Giriş sayfasına dön
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
