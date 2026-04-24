'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  posts: number
  announcements: number
  documents: number
  boardMembers: number
  members: number
  associations: number
  pendingOrders: number
  fedPendingOrders: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const mainCards = [
    { icon: '📰', label: 'Haberler', value: stats?.posts ?? '—', href: '/admin/haberler', color: 'bg-blue-500' },
    { icon: '📢', label: 'Duyurular', value: stats?.announcements ?? '—', href: '/admin/duyurular', color: 'bg-amber-500' },
    { icon: '📂', label: 'Belgeler', value: stats?.documents ?? '—', href: '/admin/belgeler', color: 'bg-teal-500' },
    { icon: '🏛', label: 'Kurul Üyeleri', value: stats?.boardMembers ?? '—', href: '/admin/yonetim', color: 'bg-purple-500' },
  ]

  const memberCards = [
    { icon: '🏢', label: 'Dernekler', value: stats?.associations ?? '—', href: '/admin/dernekler', color: 'bg-indigo-500' },
    { icon: '👥', label: 'Üyeler', value: stats?.members ?? '—', href: '/admin/uyeler', color: 'bg-green-500' },
    {
      icon: '⏳', label: 'Başkan Onayı Bekleyen',
      value: stats?.pendingOrders ?? '—',
      href: '/admin/bilezik-siparisler',
      color: stats?.pendingOrders ? 'bg-amber-500' : 'bg-gray-400',
    },
    {
      icon: '🔄', label: 'Fed. Onayı Bekleyen',
      value: stats?.fedPendingOrders ?? '—',
      href: '/admin/bilezik-siparisler',
      color: stats?.fedPendingOrders ? 'bg-blue-600' : 'bg-gray-400',
    },
  ]

  const quickActions = [
    { label: 'Yeni Haber Ekle', href: '/admin/haberler/yeni', icon: '✏️' },
    { label: 'Yeni Duyuru', href: '/admin/duyurular', icon: '📢' },
    { label: 'Belge Yükle', href: '/admin/belgeler', icon: '📎' },
    { label: 'Dernek Ekle', href: '/admin/dernekler', icon: '🏢' },
    { label: 'Bilezik Fiyatı', href: '/admin/bilezik-fiyati', icon: '💰' },
    { label: 'Mesaj Gönder', href: '/admin/mesaj-gonder', icon: '✉️' },
    { label: 'Siparişleri Onayla', href: '/admin/bilezik-siparisler', icon: '💎' },
    { label: 'Üye Listesi', href: '/admin/uyeler', icon: '👥' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Uyarı: bekleyen sipariş */}
      {(stats?.fedPendingOrders ?? 0) > 0 && (
        <Link href="/admin/bilezik-siparisler">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3 hover:bg-blue-100 transition-colors">
            <span className="text-2xl">🔔</span>
            <div>
              <div className="font-semibold text-blue-800">Federasyon onayı bekleyen {stats?.fedPendingOrders} sipariş var</div>
              <div className="text-sm text-blue-600">Tıklayarak inceleyip onaylayabilirsiniz.</div>
            </div>
          </div>
        </Link>
      )}

      {/* İçerik istatistikleri */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">İçerik</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mainCards.map(card => (
          <Link key={card.label} href={card.href}>
            <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-xl mb-3`}>{card.icon}</div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Üyelik & bilezik istatistikleri */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Üyelik & Bilezik</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {memberCards.map(card => (
          <Link key={card.label} href={card.href}>
            <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-xl mb-3`}>{card.icon}</div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Hızlı işlemler */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(action => (
            <Link key={action.label} href={action.href}>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-xs font-medium text-gray-600">{action.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
