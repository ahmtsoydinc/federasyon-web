'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UyeOlPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password2: '', phone: '', associationId: '' })
  const [associations, setAssociations] = useState<{ id: number; name: string; city?: string }[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/associations').then(r => r.json()).then(setAssociations)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) { setError('Şifreler eşleşmiyor'); return }
    if (form.password.length < 6) { setError('Şifre en az 6 karakter olmalı'); return }
    if (!form.associationId) { setError('Lütfen üye olduğunuz derneği seçin'); return }

    setLoading(true)
    const res = await fetch('/api/member/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone, associationId: form.associationId }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Kayıt başarısız'); return }
    router.push('/uye/dashboard')
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">🐓</div>
          <h1 className="text-2xl font-bold text-gray-800">Üye Kaydı</h1>
          <p className="text-sm text-gray-500 mt-1">TSHF üye portalına kayıt olun</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
            <input
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Adınız Soyadınız"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Üye Olduğunuz Dernek *</label>
            <select
              value={form.associationId} onChange={e => setForm({ ...form, associationId: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            >
              <option value="">-- Dernek Seçin --</option>
              {associations.map(a => (
                <option key={a.id} value={a.id}>{a.name}{a.city ? ` (${a.city})` : ''}</option>
              ))}
            </select>
            {associations.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Henüz dernek tanımlanmamış. Lütfen yöneticiyle iletişime geçin.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
            <input
              type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="email@ornek.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="05xx xxx xx xx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
            <input
              type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="En az 6 karakter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar *</label>
            <input
              type="password" value={form.password2} onChange={e => setForm({ ...form, password2: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Şifreyi tekrar girin"
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Kayıt yapılıyor...' : 'Üye Ol'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Zaten üye misiniz?{' '}
          <Link href="/uye-girisi" className="text-primary-600 hover:text-primary-700 font-medium">Giriş Yapın</Link>
        </p>
      </div>
    </div>
  )
}
