'use client'

import { useEffect, useState } from 'react'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:        { label: 'Onay Bekliyor',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  assoc_approved: { label: 'Federas. Bekliyor', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  fed_approved:   { label: 'Onaylandı',      color: 'bg-green-50 text-green-700 border-green-200' },
  rejected:       { label: 'Reddedildi',     color: 'bg-red-50 text-red-700 border-red-200' },
}

export default function BaskanPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [processing, setProcessing] = useState<number | null>(null)

  const fetchOrders = () => {
    setLoading(true)
    fetch('/api/bracelet/orders')
      .then(r => r.json())
      .then(setOrders)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setProcessing(id)
    await fetch(`/api/bracelet/orders/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: notes[id] || '' }),
    })
    setProcessing(null)
    fetchOrders()
  }

  const pending = orders.filter(o => o.status === 'pending')
  const others = orders.filter(o => o.status !== 'pending')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Sipariş Onay Paneli</h1>
      <p className="text-gray-500 mb-8">Derneğinize ait bilezik siparişlerini onaylayın veya reddedin.</p>

      {/* Özet */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{pending.length}</div>
          <div className="text-xs text-gray-500 mt-1">Bekleyen</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'assoc_approved' || o.status === 'fed_approved').length}</div>
          <div className="text-xs text-gray-500 mt-1">Onayladım</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{orders.length}</div>
          <div className="text-xs text-gray-500 mt-1">Toplam</div>
        </div>
      </div>

      {/* Bekleyen siparişler */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">⏳ Onay Bekleyen Siparişler ({pending.length})</h2>
              <div className="space-y-4">
                {pending.map(o => (
                  <div key={o.id} className="bg-white rounded-xl shadow-sm border-2 border-amber-100 p-5">
                    <div className="flex flex-wrap justify-between gap-3 mb-4">
                      <div>
                        <div className="font-bold text-gray-800">Bilezik No: {o.braceletNumber}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          <strong>{o.member?.name}</strong> · {o.quantity} adet
                        </div>
                        <div className="text-sm font-semibold text-primary-700 mt-0.5">
                          Toplam: ₺{Number(o.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(o.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <textarea
                      value={notes[o.id] || ''}
                      onChange={e => setNotes({ ...notes, [o.id]: e.target.value })}
                      placeholder="Not ekleyin (opsiyonel)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none mb-3"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(o.id, 'approve')}
                        disabled={processing === o.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
                      >
                        {processing === o.id ? '...' : '✓ Onayla'}
                      </button>
                      <button
                        onClick={() => handleAction(o.id, 'reject')}
                        disabled={processing === o.id}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 rounded-lg text-sm border border-red-200 transition-colors disabled:opacity-60"
                      >
                        {processing === o.id ? '...' : '✕ Reddet'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Geçmiş siparişler */}
          {others.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Geçmiş Siparişler</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
                {others.map(o => {
                  const s = STATUS_MAP[o.status] || { label: o.status, color: 'bg-gray-50 text-gray-600 border-gray-200' }
                  return (
                    <div key={o.id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-medium text-gray-800">Bilezik No: {o.braceletNumber}</span>
                        <span className="text-gray-400 text-sm ml-3">{o.member?.name} · {o.quantity} adet</span>
                        <span className="text-primary-700 text-sm font-medium ml-3">₺{Number(o.totalAmount).toLocaleString('tr-TR')}</span>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${s.color}`}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {orders.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p>Henüz sipariş bulunmuyor.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
