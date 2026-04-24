'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

function SifreSifirlaForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (!token) setError('Geçersiz link. Lütfen yeni bir sıfırlama talebi oluşturun.')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı'); return }
    if (password !== password2) { setError('Şifreler eşleşmiyor'); return }

    setLoading(true)
    const res = await fetch('/api/member/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Bir hata oluştu'); return }
    setDone(true)
    setTimeout(() => router.push('/uye-girisi'), 3000)
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Şifreniz Güncellendi!</h2>
        <p className="text-gray-500 text-sm mb-6">Yeni şifrenizle giriş yapabilirsiniz. Giriş sayfasına yönlendiriliyorsunuz...</p>
        <Link href="/uye-girisi" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
          Hemen Giriş Yap →
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Yeni Şifre Belirle</h1>
        <p className="text-sm text-gray-500 mt-1">Hesabınız için güçlü bir şifre oluşturun</p>
      </div>

      {error && !token ? (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-4 rounded-lg text-center">
          <p className="mb-3">{error}</p>
          <Link href="/sifre-unuttum" className="font-medium underline">Yeni link talep et</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-11"
                placeholder="En az 6 karakter"
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass
                  ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
            {/* Şifre güç göstergesi */}
            <div className="flex gap-1 mt-1.5">
              {[1,2,3,4].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                  password.length === 0 ? 'bg-gray-200' :
                  password.length < 6 ? (i <= 1 ? 'bg-red-400' : 'bg-gray-200') :
                  password.length < 9 ? (i <= 2 ? 'bg-amber-400' : 'bg-gray-200') :
                  password.length < 12 ? (i <= 3 ? 'bg-blue-400' : 'bg-gray-200') :
                  'bg-green-400'
                }`} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${
                password2 && password !== password2 ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Şifreyi tekrar girin"
            />
            {password2 && password !== password2 && (
              <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Kaydediliyor...' : 'Şifremi Güncelle'}
          </button>
        </form>
      )}
    </>
  )
}

export default function SifreSifirlaPage() {
  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <Suspense fallback={<div className="text-center text-gray-400 py-8">Yükleniyor...</div>}>
          <SifreSifirlaForm />
        </Suspense>
      </div>
    </div>
  )
}
