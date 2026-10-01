'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function UyeDashboard() {
  const [member, setMember] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [kvkkDoc, setKvkkDoc] = useState<any>(null)
  const [showKvkkModal, setShowKvkkModal] = useState(false)
  const [kvkkLoading, setKvkkLoading] = useState(false)

  useEffect(() => {
    fetch('/api/member/me').then(r => r.json()).then(d => setMember(d.member ?? d))
    fetch('/api/documents').then(r => r.json()).then((docs: any[]) => {
      const kvkk = docs.find((d: any) => d.title.toLowerCase().includes('kvkk'))
      if (kvkk) setKvkkDoc(kvkk)
    }).catch(() => {})
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


      {/* KVKK Durumu */}
      {member && !member.kvkkApproved && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-600">⚠️</span>
                <span className="text-sm font-semibold text-amber-800">KVKK Aydınlatma ve Rıza Metni Onaylanmadı</span>
              </div>
              <p className="text-xs text-amber-700">Onaylanmaması durumunda yarışma kayıtlarında sadece isminiz ve dernek adınız görünecek, telefon ve e-posta bilgileriniz paylaşılmayacaktır.</p>
            </div>
            <button
              onClick={() => setShowKvkkModal(true)}
              className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Onayla
            </button>
          </div>
        </div>
      )}
      {member && member.kvkkApproved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 flex items-center gap-2">
          <span className="text-green-600">✅</span>
          <span className="text-sm text-green-700 font-medium">KVKK Aydınlatma ve Rıza Metni onaylandı</span>
        </div>
      )}

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

      {showKvkkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">KVKK Aydınlatma ve Rıza Metni</h2>
              <button onClick={() => setShowKvkkModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-hidden p-4" style={{ minHeight: '400px' }}>
              {kvkkDoc ? (
                <iframe src={kvkkDoc.fileUrl} className="w-full h-full rounded-lg border border-gray-200" style={{ minHeight: '380px' }} title="KVKK" />
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">Belge yükleniyor...</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                disabled={kvkkLoading}
                onClick={async () => {
                  setKvkkLoading(true)
                  await fetch('/api/member/kvkk-approve', { method: 'POST' })
                  setMember((m: any) => ({ ...m, kvkkApproved: true }))
                  setShowKvkkModal(false)
                  setKvkkLoading(false)
                }}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm"
              >
                {kvkkLoading ? 'İşleniyor...' : 'Okudum, Onaylıyorum'}
              </button>
              <button onClick={() => setShowKvkkModal(false)} className="px-5 text-gray-600 text-sm">Kapat</button>
            </div>
          </div>
        </div>
      )}
  )
}
