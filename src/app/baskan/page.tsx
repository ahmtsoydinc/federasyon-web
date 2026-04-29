'use client'

import { useEffect, useState } from 'react'

const BRACELET_STATUS: Record<string, { label: string; color: string }> = {
  pending:        { label: 'Onay Bekliyor',      color: 'bg-amber-50 text-amber-700 border-amber-200' },
  assoc_approved: { label: 'Federas. Bekliyor',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  fed_approved:   { label: 'Onaylandı',          color: 'bg-green-50 text-green-700 border-green-200' },
  rejected:       { label: 'Reddedildi',         color: 'bg-red-50 text-red-700 border-red-200' },
}

const ANIMAL_STATUS: Record<string, { label: string; color: string }> = {
  pending:        { label: 'Taslak (Gönderilmedi)', color: 'bg-gray-50 text-gray-500 border-gray-200' },
  submitted:      { label: 'Onay Bekliyor',          color: 'bg-amber-50 text-amber-700 border-amber-200' },
  assoc_approved: { label: 'Onaylandı',              color: 'bg-green-50 text-green-700 border-green-200' },
  fed_approved:   { label: 'Fed. Onaylandı',         color: 'bg-blue-50 text-blue-700 border-blue-200' },
  rejected:       { label: 'Reddedildi',             color: 'bg-red-50 text-red-700 border-red-200' },
}

const TYPE_LABELS: Record<string, string> = {
  TAVUK: 'Tavuk', HOROZ: 'Horoz', ORDEK: 'Ördek', GUVERCIN: 'Güvercin',
  TAVSAN: 'Tavşan', KAZ: 'Kaz', HINDI: 'Hindi', BILDIRCIN: 'Bıldırcın',
}

export default function BaskanPage() {
  const [tab, setTab] = useState<'bilezik' | 'yarisma'>('bilezik')

  // Bilezik state
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [orderNotes, setOrderNotes] = useState<Record<number, string>>({})
  const [orderProcessing, setOrderProcessing] = useState<number | null>(null)

  // Yarışma state
  const [animals, setAnimals] = useState<any[]>([])
  const [animalsLoading, setAnimalsLoading] = useState(true)
  const [animalNotes, setAnimalNotes] = useState<Record<number, string>>({})
  const [animalProcessing, setAnimalProcessing] = useState<number | null>(null)
  const [activeCompetition, setActiveCompetition] = useState<any>(null)

  const fetchOrders = () => {
    setOrdersLoading(true)
    fetch('/api/bracelet/orders')
      .then(r => r.json())
      .then(setOrders)
      .finally(() => setOrdersLoading(false))
  }

  const fetchAnimals = async () => {
    setAnimalsLoading(true)
    const compRes = await fetch('/api/competitions/active')
    const compData = await compRes.json()
    if (compData.competition) {
      setActiveCompetition(compData.competition)
      const animalRes = await fetch(`/api/competition-animals?competitionId=${compData.competition.id}`)
      const data = await animalRes.json()
      setAnimals(Array.isArray(data) ? data : [])
    }
    setAnimalsLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    fetchAnimals()
  }, [])

  const handleOrderAction = async (id: number, action: 'approve' | 'reject') => {
    setOrderProcessing(id)
    await fetch(`/api/bracelet/orders/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: orderNotes[id] || '' }),
    })
    setOrderProcessing(null)
    fetchOrders()
  }

  const handleAnimalApprove = async (id: number) => {
    setAnimalProcessing(id)
    await fetch(`/api/competition-animals/${id}/approve`, { method: 'POST' })
    setAnimalProcessing(null)
    fetchAnimals()
  }

  const handleAnimalReject = async (id: number) => {
    setAnimalProcessing(id)
    await fetch(`/api/competition-animals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: animalNotes[id] || '' }),
    })
    setAnimalProcessing(null)
    fetchAnimals()
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const otherOrders = orders.filter(o => o.status !== 'pending')
  // Başkan sadece "submitted" (üye onayladı) hayvanları işler
  const pendingAnimals = animals.filter(a => a.status === 'submitted')
  const otherAnimals = animals.filter(a => a.status !== 'submitted')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Dernek Başkanı Paneli</h1>
      <p className="text-gray-500 mb-6">Siparişleri ve yarışma kayıtlarını onaylayın.</p>

      {/* Sekmeler */}
      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setTab('bilezik')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'bilezik' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Bilezik Siparişleri
          {pendingOrders.length > 0 && <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingOrders.length}</span>}
        </button>
        <button onClick={() => setTab('yarisma')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'yarisma' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Yarışma Kayıtları
          {pendingAnimals.length > 0 && <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingAnimals.length}</span>}
        </button>
      </div>

      {/* BİLEZİK SEKMESİ */}
      {tab === 'bilezik' && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{pendingOrders.length}</div>
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

          {ordersLoading ? (
            <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
          ) : (
            <>
              {pendingOrders.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Onay Bekleyen Siparişler ({pendingOrders.length})</h2>
                  <div className="space-y-4">
                    {pendingOrders.map(o => (
                      <div key={o.id} className="bg-white rounded-xl shadow-sm border-2 border-amber-100 p-5">
                        <div className="font-bold text-gray-800">Bilezik No: {o.braceletNumber}</div>
                        <div className="text-sm text-gray-500 mt-0.5"><strong>{o.member?.name}</strong> · {o.quantity} adet</div>
                        <div className="text-sm font-semibold text-primary-700 mt-0.5">₺{Number(o.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                        <textarea value={orderNotes[o.id] || ''} onChange={e => setOrderNotes({ ...orderNotes, [o.id]: e.target.value })}
                          placeholder="Not ekleyin (opsiyonel)" rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none mt-3 mb-3" />
                        <div className="flex gap-3">
                          <button onClick={() => handleOrderAction(o.id, 'approve')} disabled={orderProcessing === o.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
                            {orderProcessing === o.id ? '...' : '✓ Onayla'}
                          </button>
                          <button onClick={() => handleOrderAction(o.id, 'reject')} disabled={orderProcessing === o.id}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 rounded-lg text-sm border border-red-200 transition-colors disabled:opacity-60">
                            {orderProcessing === o.id ? '...' : '✕ Reddet'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {otherOrders.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Geçmiş Siparişler</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
                    {otherOrders.map(o => {
                      const s = BRACELET_STATUS[o.status] || { label: o.status, color: 'bg-gray-50 text-gray-600 border-gray-200' }
                      return (
                        <div key={o.id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="font-medium text-gray-800">Bilezik No: {o.braceletNumber}</span>
                            <span className="text-gray-400 text-sm ml-3">{o.member?.name} · {o.quantity} adet</span>
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
        </>
      )}

      {/* YARIŞMA SEKMESİ */}
      {tab === 'yarisma' && (
        <>
          {!activeCompetition ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🏆</div>
              <p>Aktif yarışma bulunmuyor.</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-blue-800">{activeCompetition.name}</p>
              </div>

              {animalsLoading ? (
                <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
              ) : (
                <>
                  {pendingAnimals.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold text-gray-700 mb-4">Onay Bekleyen Kayıtlar ({pendingAnimals.length})</h2>
                      <div className="space-y-4">
                        {pendingAnimals.map(a => (
                          <div key={a.id} className="bg-white rounded-xl shadow-sm border-2 border-amber-100 p-5">
                            <div className="mb-3">
                              <div className="font-bold text-gray-800">
                                {TYPE_LABELS[a.animalType] || a.animalType}
                                {a.breed && <span className="text-gray-500 font-normal text-sm ml-1">({a.breed === 'DEV' ? 'Dev' : 'Cüce'})</span>}
                                {a.gender && <span className="text-gray-500 font-normal text-sm ml-1">{a.gender === 'ERKEK' ? '· Erkek' : '· Dişi'}</span>}
                              </div>
                              <div className="text-sm text-gray-600 mt-0.5">{a.species} / {a.color}</div>
                              {a.entryType === 'COLLECTION' && a.collectionGroup && (
                                <div className="text-xs text-purple-600 mt-0.5">Koleksiyon {a.collectionGroup.groupNumber}</div>
                              )}
                              <div className="text-xs text-gray-400 mt-0.5">
                                {a.animalType === 'TAVSAN'
                                  ? (a.chipNumber ? `Cip: ${a.chipNumber}` : `Dövme: ${a.tattooLeftEar} / ${a.tattooRightEar}`)
                                  : (a.braceletYear ? `${a.braceletYear} / ${a.braceletNumber || '—'}` : '—')
                                }
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">Üye: {a.member?.name}</div>
                            </div>
                            <textarea value={animalNotes[a.id] || ''} onChange={e => setAnimalNotes({ ...animalNotes, [a.id]: e.target.value })}
                              placeholder="Red notu (opsiyonel)" rows={2}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none mb-3" />
                            <div className="flex gap-3">
                              <button onClick={() => handleAnimalApprove(a.id)} disabled={animalProcessing === a.id}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60">
                                {animalProcessing === a.id ? '...' : '✓ Onayla'}
                              </button>
                              <button onClick={() => handleAnimalReject(a.id)} disabled={animalProcessing === a.id}
                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 rounded-lg text-sm border border-red-200 disabled:opacity-60">
                                {animalProcessing === a.id ? '...' : '✕ Reddet'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {otherAnimals.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-700 mb-4">İşlem Görenler</h2>
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
                        {otherAnimals.map(a => {
                          const s = ANIMAL_STATUS[a.status] || { label: a.status, color: 'bg-gray-50 text-gray-600 border-gray-200' }
                          return (
                            <div key={a.id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <span className="font-medium text-gray-800">{TYPE_LABELS[a.animalType]}</span>
                                <span className="text-gray-400 text-sm ml-2">{a.species} / {a.color}</span>
                                <span className="text-gray-400 text-sm ml-2">· {a.member?.name}</span>
                              </div>
                              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${s.color}`}>{s.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {animals.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <div className="text-5xl mb-3">📭</div>
                      <p>Henüz yarışma kaydı bulunmuyor.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
