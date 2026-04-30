'use client'

import { useEffect, useState } from 'react'

const STATUS_MAP: Record<string, { label: string; badge: string; step: number }> = {
  pending:        { label: 'Başkan Onayı Bekleniyor', badge: 'bg-amber-100 text-amber-700',  step: 1 },
  assoc_approved: { label: 'Federasyon Onayı Bekleniyor', badge: 'bg-blue-100 text-blue-700', step: 2 },
  fed_approved:   { label: 'Onaylandı',    badge: 'bg-green-100 text-green-700', step: 3 },
  rejected:       { label: 'Reddedildi',   badge: 'bg-red-100 text-red-700',    step: 0 },
}

export default function BilezikSiparislerPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [processing, setProcessing] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetchOrders = () => {
    setLoading(true)
    const url = filter === 'all' ? '/api/bracelet/orders' : `/api/bracelet/orders?status=${filter}`
    fetch(url)
      .then(r => r.json())
      .then(setOrders)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [filter])

  const handleApprove = async (id: number) => {
    setProcessing(id)
    const res = await fetch(`/api/bracelet/orders/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: notes[id] || '' }),
    })
    setProcessing(null)
    if (res.ok) fetchOrders()
    else { const d = await res.json(); alert(d.error) }
  }

  const handleReject = async (id: number) => {
    if (!confirm('Bu siparişi reddetmek istiyor musunuz?')) return
    setProcessing(id)
    await fetch(`/api/bracelet/orders/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: notes[id] || '' }),
    })
    setProcessing(null)
    fetchOrders()
  }

  const handleDelete = async (id: number, orderNum: string) => {
    if (!confirm(`Sipariş #${orderNum} kalıcı olarak silinecek. Emin misiniz?`)) return
    setProcessing(id)
    await fetch(`/api/bracelet/orders/${id}`, { method: 'DELETE' })
    setProcessing(null)
    setExpandedId(null)
    fetchOrders()
  }

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    assoc_approved: orders.filter(o => o.status === 'assoc_approved').length,
    fed_approved: orders.filter(o => o.status === 'fed_approved').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
  }

  const totalApproved = orders
    .filter(o => o.status === 'fed_approved')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0)

  const filterTabs = [
    { key: 'all', label: 'Tümü' },
    { key: 'assoc_approved', label: 'Fed. Onayı Bekleyen' },
    { key: 'pending', label: 'Başkan Bekleyen' },
    { key: 'fed_approved', label: 'Onaylananlar' },
    { key: 'rejected', label: 'Reddedilenler' },
  ]

  const handleExport = () => {
    const url = filter === 'all'
      ? '/api/bracelet/orders/export'
      : `/api/bracelet/orders/export?status=${filter}`
    window.open(url, '_blank')
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bilezik Siparişleri</h1>
        <div className="flex items-center gap-3">
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 text-sm">
            <span className="text-gray-500">Onaylanan toplam:</span>{' '}
            <span className="font-bold text-green-700">₺{totalApproved.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Excel İndir
          </button>
        </div>
      </div>

      {/* Filtre sekmeleri */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === tab.key
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-500'
            }`}>
              {counts[tab.key as keyof typeof counts] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">Yükleniyor...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
          <div className="text-4xl mb-3">💎</div>
          Sipariş bulunamadı.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const s = STATUS_MAP[o.status] || { label: o.status, badge: 'bg-gray-100 text-gray-600', step: 0 }
            const isExpanded = expandedId === o.id
            const canFedApprove = o.status === 'assoc_approved'

            return (
              <div key={o.id} className={`bg-white rounded-xl shadow-sm border ${canFedApprove ? 'border-blue-200' : 'border-gray-100'}`}>
                {/* Başlık */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : o.id)}
                  className="w-full text-left px-5 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-semibold text-gray-800">
                          Sipariş #{o.id} — Bilezik No: <span className="text-primary-700">{o.braceletNumber}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          <strong>{o.member?.name}</strong> · {o.association?.name} · {o.quantity} adet
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary-700">
                        ₺{Number(o.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.badge}`}>{s.label}</span>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(o.id, String(o.id)) }}
                        disabled={processing === o.id}
                        title="Siparişi sil"
                        className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40 p-1"
                      >
                        🗑
                      </button>
                      <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </button>

                {/* Detay */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-50">
                    {/* Onay akış çizgisi */}
                    <div className="flex items-center gap-2 my-4">
                      {['Sipariş Verildi', 'Başkan Onayladı', 'Fed. Onayladı'].map((step, i) => (
                        <div key={step} className="flex items-center gap-2 flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            s.step > i ? 'bg-green-500 text-white' :
                            s.step === i + 1 ? 'bg-blue-500 text-white' :
                            'bg-gray-200 text-gray-400'
                          }`}>{i + 1}</div>
                          <span className="text-xs text-gray-500 hidden sm:block">{step}</span>
                          {i < 2 && <div className={`flex-1 h-px ${s.step > i + 1 ? 'bg-green-300' : 'bg-gray-200'}`} />}
                        </div>
                      ))}
                    </div>

                    {/* Detay bilgileri */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between"><span className="text-gray-500">Üye</span><span className="font-medium">{o.member?.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">E-posta</span><span>{o.member?.email}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Dernek</span><span>{o.association?.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Sipariş Tarihi</span><span>{new Date(o.createdAt).toLocaleDateString('tr-TR')}</span></div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between"><span className="text-gray-500">Bilezik No</span><span className="font-bold text-primary-700">{o.braceletNumber}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Adet</span><span className="font-medium">{o.quantity}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Birim Fiyat (25 ad.)</span><span>₺{Number(o.pricePerUnit).toLocaleString('tr-TR')}</span></div>
                        <div className="flex justify-between font-bold"><span className="text-gray-700">Toplam</span><span className="text-primary-700">₺{Number(o.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span></div>
                      </div>
                    </div>

                    {o.presidentNote && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-sm mb-3">
                        <span className="font-medium text-amber-700">Başkan Notu:</span> {o.presidentNote}
                      </div>
                    )}
                    {o.adminNote && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm mb-3">
                        <span className="font-medium text-blue-700">Federasyon Notu:</span> {o.adminNote}
                      </div>
                    )}

                    {/* Silme */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleDelete(o.id, String(o.id))}
                        disabled={processing === o.id}
                        className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                      >
                        🗑 Siparişi Kalıcı Olarak Sil
                      </button>
                    </div>

                    {/* Federasyon onay/ret (sadece assoc_approved için) */}
                    {canFedApprove && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <textarea
                          value={notes[o.id] || ''}
                          onChange={e => setNotes({ ...notes, [o.id]: e.target.value })}
                          placeholder="Federasyon notu ekleyin (opsiyonel)"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none mb-3"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(o.id)}
                            disabled={processing === o.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
                          >
                            {processing === o.id ? '...' : '✓ Federasyon Onayı Ver'}
                          </button>
                          <button
                            onClick={() => handleReject(o.id)}
                            disabled={processing === o.id}
                            className="px-4 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 rounded-lg text-sm border border-red-200 transition-colors disabled:opacity-60"
                          >
                            Reddet
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
