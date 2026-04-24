'use client'

import { useEffect, useState } from 'react'

export default function BilezikFiyatiPage() {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [newPrice, setNewPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/bracelet/price')
      .then(r => r.json())
      .then(d => {
        setCurrentPrice(d.price)
        if (d.price > 0) setNewPrice(String(d.price))
      })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    const val = parseFloat(newPrice.replace(',', '.'))
    if (isNaN(val) || val <= 0) { setError('Geçerli bir tutar girin'); return }

    setSaving(true)
    const res = await fetch('/api/bracelet/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: val }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Hata oluştu'); return }
    setCurrentPrice(data.pricePerUnit)
    setMessage('✓ Fiyat başarıyla güncellendi.')
  }

  // Örnek hesaplama önizlemesi
  const previewPrice = parseFloat(newPrice.replace(',', '.')) || 0
  const examples = [25, 50, 75, 100, 150, 200]

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Bilezik Fiyatı Yönetimi</h1>
      <p className="text-gray-500 mb-8">
        25 adetlik birim fiyatını belirleyin. Üyeler sipariş verirken toplam tutar otomatik hesaplanır.
      </p>

      {/* Mevcut fiyat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Mevcut Birim Fiyat (25 adet)</div>
            <div className="text-3xl font-bold text-primary-700">
              {currentPrice !== null
                ? currentPrice > 0 ? `₺${currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : 'Belirlenmedi'
                : '—'}
            </div>
          </div>
          <div className="text-5xl opacity-20">💎</div>
        </div>
      </div>

      {/* Fiyat güncelleme formu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Fiyat Belirle / Güncelle</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              25 Adetlik Birim Fiyatı (₺) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₺</span>
              <input
                type="text"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-lg font-semibold"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Örnek: 50 bilezik siparişinde toplam = 2 birim × ₺{previewPrice > 0 ? previewPrice.toLocaleString('tr-TR') : '?'}
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
          {message && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">{message}</div>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Kaydediliyor...' : '💾 Fiyatı Kaydet'}
          </button>
        </form>
      </div>

      {/* Önizleme tablosu */}
      {previewPrice > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Fiyat Önizleme</h2>
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Adet</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Birim Sayısı</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Toplam Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {examples.map(qty => (
                  <tr key={qty} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">{qty} adet</td>
                    <td className="px-4 py-2.5 text-gray-500">{qty / 25} birim</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-primary-700">
                      ₺{(previewPrice * qty / 25).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
