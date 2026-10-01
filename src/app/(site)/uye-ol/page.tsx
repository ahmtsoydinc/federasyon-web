'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function UyeOlPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password2: '', phone: '', associationId: '' })
  const [kvkkApproved, setKvkkApproved] = useState(false)
  const [kvkkDoc, setKvkkDoc] = useState<{ id: number; title: string; fileUrl: string } | null>(null)
  const [showKvkkModal, setShowKvkkModal] = useState(false)
  const [associations, setAssociations] = useState<{ id: number; name: string; city?: string }[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    fetch('/api/associations').then(r => r.json()).then(setAssociations)
    fetch('/api/documents').then(r => r.json()).then((docs: any[]) => {
      const kvkk = docs.find((d: any) => d.title.toLowerCase().includes('kvkk'))
      if (kvkk) setKvkkDoc(kvkk)
    }).catch(() => {})
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
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone, associationId: form.associationId, kvkkApproved }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Kayıt başarısız'); return }
    setRegistered(true)
  }

  if (registered) {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Başvurunuz Alındı!</h2>
          <p className="text-gray-500 text-sm mb-4">
            Kayıt başvurunuz dernek başkanınıza iletildi. Başkanınız onayladıktan sonra sisteme giriş yapabilirsiniz.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 mb-6">
            ⏳ Onay bekleniyor — başkanınızla iletişime geçebilirsiniz.
          </div>
          <Link href="/uye-girisi" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">🐓</div>
          <h1 className="text-2xl font-bold text-gray-800">Üye Kaydı</h1>
          <p className="text-sm text-gray-500 mt-1">TSHF üye portalına kayıt olun</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 mb-5">
          ℹ️ Kayıt başvurunuz dernek başkanınız tarafından onaylandıktan sonra aktif olacaktır.
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


          {/* KVKK Bölümü */}
          <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
            <p className="text-xs font-semibold text-amber-800 mb-2">📋 KVKK Aydınlatma ve Rıza Metni</p>
            <p className="text-xs text-amber-700 mb-3">
              KVKK Aydınlatma ve Rıza Metni onaylanmaması durumunda Sadece İsminiz Soyisminiz ve Dernek Adınız olacak ve Diğer Bilgileriniz BULUNMAYACAKTIR.
            </p>
            {kvkkDoc && (
              <button
                type="button"
                onClick={() => setShowKvkkModal(true)}
                className="text-xs text-primary-600 hover:text-primary-700 underline mb-3 block"
              >
                KVKK Aydınlatma ve Rıza Metni&apos;ni görüntüle →
              </button>
            )}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={kvkkApproved}
                onChange={e => setKvkkApproved(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-primary-600 rounded flex-shrink-0"
              />
              <span className="text-xs text-gray-700">
                KVKK Aydınlatma ve Rıza Metni&apos;ni okudum ve onaylıyorum
              </span>
            </label>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Gönderiliyor...' : 'Başvur'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Zaten üye misiniz?{' '}
          <Link href="/uye-girisi" className="text-primary-600 hover:text-primary-700 font-medium">Giriş Yapın</Link>
        </p>
      </div>
      {/* KVKK Belge Modalı */}
      {showKvkkModal && kvkkDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">{kvkkDoc.title}</h2>
              <button onClick={() => setShowKvkkModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-hidden p-4" style={{ minHeight: '400px' }}>
              <iframe
                src={kvkkDoc.fileUrl}
                className="w-full h-full rounded-lg border border-gray-200"
                style={{ minHeight: '380px' }}
                title="KVKK Aydınlatma ve Rıza Metni"
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { setKvkkApproved(true); setShowKvkkModal(false) }}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Okudum, Onaylıyorum
              </button>
              <button
                onClick={() => setShowKvkkModal(false)}
                className="px-5 text-gray-600 hover:text-gray-800 text-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
