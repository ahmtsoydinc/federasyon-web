'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  pending:        { label: 'Başkan Onayı Bekleniyor', color: 'bg-amber-50 text-amber-700 border-amber-200',  icon: '⏳' },
  assoc_approved: { label: 'Federasyon Onayı Bekleniyor', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔄' },
  fed_approved:   { label: 'Onaylandı',   color: 'bg-green-50 text-green-700 border-green-200', icon: '✅' },
  rejected:       { label: 'Reddedildi',  color: 'bg-red-50 text-red-700 border-red-200',       icon: '❌' },
}

export default function SiparislerimPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/member/orders')
      .then(r => r.json())
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-16 text-gray-400">Yükleniyor...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Siparişlerim</h1>
        <Link href="/uye/bilezik-siparis" className="bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-700">
          + Yeni Sipariş
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-3">💎</div>
          <p className="text-gray-500 mb-4">Henüz sipariş vermediniz.</p>
          <Link href="/uye/bilezik-siparis" className="text-primary-600 font-medium hover:text-primary-700">İlk Siparişinizi Verin →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const s = STATUS_MAP[o.status] || { label: o.status, color: 'bg-gray-50 text-gray-600 border-gray-200', icon: '?' }
            return (
              <div key={o.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800 text-lg">Bilezik No: {o.braceletNumber}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {o.quantity} adet ·{' '}
                      <span className="font-medium text-gray-700">₺{Number(o.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(o.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1.5 rounded-full border ${s.color}`}>
                    {s.icon} {s.label}
                  </span>
                </div>

                {/* Notlar */}
                {(o.presidentNote || o.adminNote) && (
                  <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                    {o.presidentNote && (
                      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="font-medium">Başkan Notu:</span> {o.presidentNote}
                      </div>
                    )}
                    {o.adminNote && (
                      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="font-medium">Federasyon Notu:</span> {o.adminNote}
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
