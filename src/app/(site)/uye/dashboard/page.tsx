'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function UyeDashboard() {
  const [member, setMember] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/member/me').then(r => r.json()).then(d => setMember(d.member))
    fetch('/api/bracelet/orders').then(r => r.json()).then(setOrders).catch(() => {})
    fetch('/api/messages').then(r => r.json()).then(setMessages).catch(() => {})
  }, [])

  const unread = messages.filter(m => !m.read).length
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'assoc_approved').length
  const approvedOrders = orders.filter(o => o.status === 'fed_approved').length

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: 'Dernek Başkanı Onayı Bekleniyor', color: 'text-amber-600 bg-amber-50' },
    assoc_approved: { label: 'Federasyon Onayı Bekleniyor', color: 'text-blue-600 bg-blue-50' },
    fed_approved: { label: 'Onaylandı', color: 'text-green-600 bg-green-50' },
    rejected: { label: 'Reddedildi', color: 'text-red-600 bg-red-50' },
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Hoş Geldiniz{member ? `, ${member.name}` : ''}!</h1>
      <p className="text-gray-500 mb-8">Üye portalına hoş geldiniz.</p>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: '📋', label: 'Toplam Sipariş', value: orders.length, href: '/uye/siparislerim', color: 'bg-blue-500' },
          { icon: '⏳', label: 'Bekleyen', value: pendingOrders, href: '/uye/siparislerim', color: 'bg-amber-500' },
          { icon: '✅', label: 'Onaylı', value: approvedOrders, href: '/uye/siparislerim', color: 'bg-green-500' },
          { icon: '✉️', label: 'Okunmamış', value: unread, href: '/uye/mesajlar', color: 'bg-purple-500' },
        ].map(c => (
          <Link key={c.label} href={c.href}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center text-xl mb-3`}>{c.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{c.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Hızlı işlemler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/uye/bilezik-siparis" className="border-2 border-dashed border-primary-200 rounded-xl p-4 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <div className="text-3xl mb-2">💎</div>
              <div className="text-sm font-medium text-gray-600">Bilezik Sipariş Et</div>
            </Link>
            <Link href="/uye/yarisma-kayit" className="border-2 border-dashed border-amber-200 rounded-xl p-4 text-center hover:border-amber-400 hover:bg-amber-50 transition-colors">
              <div className="text-3xl mb-2">🏅</div>
              <div className="text-sm font-medium text-gray-600">Yarışma Kaydı</div>
            </Link>
            <Link href="/uye/mesajlar" className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <div className="text-3xl mb-2">✉️</div>
              <div className="text-sm font-medium text-gray-600">Mesajlarım</div>
              {unread > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Son siparişler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Son Siparişler</h2>
            <Link href="/uye/siparislerim" className="text-xs text-primary-600 hover:text-primary-700">Tümü →</Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-4">Henüz sipariş yok.</div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 3).map(o => {
                const s = statusLabel[o.status] || { label: o.status, color: 'text-gray-600 bg-gray-50' }
                return (
                  <div key={o.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">#{o.braceletNumber}</span>
                      <span className="text-gray-400 ml-2">{o.quantity} adet</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
