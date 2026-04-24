'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const BRACELET_NUMBERS = Array.from({ length: 31 }, (_, i) => String(i + 5).padStart(3, '0')) // 005–035
const QUANTITY_OPTIONS = [25, 50, 75, 100, 125, 150, 175, 200]

interface BraceletItem {
  number: string
  quantity: number
}

export default function BilezikSiparisPage() {
  const [member, setMember] = useState<any>(null)
  const [price, setPrice] = useState<number>(0)
  const [items, setItems] = useState<BraceletItem[]>([]) // seçili numaralar + adetleri
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/member/me').then(r => r.json()).then(d => setMember(d.member))
    fetch('/api/bracelet/price').then(r => r.json()).then(d => setPrice(d.price || 0))
  }, [])

  const toggleNumber = (n: string) => {
    setItems(prev =>
      prev.find(i => i.number === n)
        ? prev.filter(i => i.number !== n)
        : [...prev, { number: n, quantity: 25 }]
    )
  }

  const setQuantity = (n: string, q: number) => {
    setItems(prev => prev.map(i => i.number === n ? { ...i, quantity: q } : i))
  }

  const grandTotal = items.reduce((sum, i) => sum + price * (i.quantity / 25), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (items.length === 0) { setError('En az bir bilezik numarası seçin'); return }

    setLoading(true)
    try {
      for (const item of items) {
        const res = await fetch('/api/bracelet/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ braceletNumber: item.number, quantity: item.quantity }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(`${item.number} numarası için hata: ${data.error || 'Sipariş oluşturulamadı'}`)
          setLoading(false)
          return
        }
      }
      setSuccess(true)
      setTimeout(() => router.push('/uye/siparislerim'), 2000)
    } catch {
      setError('Bağlantı hatası')
      setLoading(false)
    }
  }

  // Bireysel üye kontrolü
  if (member && member.association?.isBireysel) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-4">ℹ️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Bilezik Siparişi Oluşturulamaz</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5 text-amber-800 text-sm leading-relaxed">
          <strong>BÜNYEMİZDE BULUNAN DERNEKLERE ÜYE OLUNMASI GEREKMEKTEDİR.</strong>
          <p className="mt-2 text-amber-700 font-normal">Bilezik siparişi verebilmek için federasyona bağlı bir derneğin resmi üyesi olmanız gerekmektedir.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{items.length} Sipariş Oluşturuldu!</h2>
        <p className="text-gray-500">Siparişleriniz dernek başkanınızın onayına gönderildi.</p>
        <p className="text-sm text-gray-400 mt-2">Siparişler sayfasına yönlendiriliyorsunuz...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Bilezik Sipariş Et</h1>
      <p className="text-gray-500 mb-8">Siparişiniz önce dernek başkanınızın, ardından federasyon yetkilisinin onayına sunulacaktır.</p>

      {member && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="text-sm text-primary-700">
            <strong>{member.name}</strong> olarak <strong>{member.association?.name}</strong> derneği adına sipariş veriyorsunuz.
          </div>
        </div>
      )}

      {price === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700">
          ⚠️ Bilezik birim fiyatı henüz belirlenmemiş.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

        {/* Bilezik numaraları — çoklu seçim */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Bilezik Numarası Seçin (005–035)
            </label>
            {items.length > 0 && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                {items.length} seçildi
              </span>
            )}
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
            {BRACELET_NUMBERS.map(n => {
              const selected = items.find(i => i.number === n)
              return (
                <button
                  key={n} type="button" onClick={() => toggleNumber(n)}
                  className={`py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                    selected
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  {n}
                </button>
              )
            })}
          </div>
          {items.length > 0 && (
            <button type="button" onClick={() => setItems([])} className="text-xs text-gray-400 hover:text-red-500 underline mt-2">
              Tümünü kaldır
            </button>
          )}
        </div>

        {/* Seçili numaralar + adet girişi */}
        {items.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Her Numara İçin Adet Belirleyin (25'in katları)
            </label>
            <div className="space-y-3">
              {items.sort((a, b) => a.number.localeCompare(b.number)).map(item => (
                <div key={item.number} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                    {item.number}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1.5">Bilezik No: {item.number}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {QUANTITY_OPTIONS.map(q => (
                        <button
                          key={q} type="button"
                          onClick={() => setQuantity(item.number, q)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                            item.quantity === q
                              ? 'border-primary-600 bg-primary-600 text-white'
                              : 'border-gray-200 text-gray-600 hover:border-primary-300'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-gray-400">Tutar</div>
                    <div className="text-sm font-bold text-primary-700">
                      {price > 0 ? `₺${(price * item.quantity / 25).toLocaleString('tr-TR')}` : '—'}
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleNumber(item.number)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toplam özet */}
        {items.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-700 text-sm">Sipariş Özeti</h3>
            {items.sort((a, b) => a.number.localeCompare(b.number)).map(item => (
              <div key={item.number} className="flex justify-between text-sm text-gray-600">
                <span>No {item.number} × {item.quantity} adet</span>
                <span className="font-medium">
                  {price > 0 ? `₺${(price * item.quantity / 25).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—'}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
              <span>Genel Toplam ({items.length} sipariş)</span>
              <span className="text-primary-700">
                {price > 0 ? `₺${grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—'}
              </span>
            </div>
          </div>
        )}

        {/* Onay akışı */}
        <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto pb-1">
          {['Üye Siparişi', 'Başkan Onayı', 'Federasyon Onayı'].map((step, i) => (
            <div key={step} className="flex items-center gap-1 shrink-0">
              {i > 0 && <div className="w-6 sm:w-10 h-px bg-gray-200 shrink-0" />}
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">{i + 1}</span>
              <span className="whitespace-nowrap">{step}</span>
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <button
          type="submit" disabled={loading || items.length === 0}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-base"
        >
          {loading ? 'Gönderiliyor...'
            : items.length === 0 ? 'Bilezik numarası seçin'
            : `💎 ${items.length} Sipariş Oluştur`}
        </button>
      </form>
    </div>
  )
}
