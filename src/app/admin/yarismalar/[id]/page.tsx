'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Bekliyor', color: 'bg-amber-50 text-amber-700' },
  assoc_approved: { label: 'Başkan Onaylı', color: 'bg-blue-50 text-blue-700' },
  fed_approved: { label: 'Fed. Onaylı', color: 'bg-green-50 text-green-700' },
  rejected: { label: 'Reddedildi', color: 'bg-red-50 text-red-700' },
}

const TYPE_LABELS: Record<string, string> = {
  TAVUK: 'Tavuk', HOROZ: 'Horoz', ORDEK: 'Ördek', GUVERCIN: 'Güvercin',
  TAVSAN: 'Tavşan', KAZ: 'Kaz', HINDI: 'Hindi', BILDIRCIN: 'Bıldırcın',
}

interface Animal {
  id: number; animalType: string; breed: string | null; gender: string | null
  species: string; color: string; braceletYear: number | null; braceletNumber: string | null
  chipNumber: string | null; status: string; cageNumber: number | null
  individualScore: number | null; awards: string; entryType: string
  member: { id: number; name: string; association: { id: number; name: string } }
  collectionGroup: { id: number; groupNumber: number; groupScore: number | null } | null
}

interface AwardType { id: number; name: string }

export default function YarismaDetailPage() {
  const { id } = useParams()
  const [tab, setTab] = useState<'hayvanlar' | 'puanlar' | 'kafes'>('hayvanlar')
  const [animals, setAnimals] = useState<Animal[]>([])
  const [awards, setAwards] = useState<AwardType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [assigning, setAssigning] = useState(false)
  const [assignResult, setAssignResult] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<number, { score: string; groupScore: string; selectedAwards: string[] }>>({})
  const [saving, setSaving] = useState<number | null>(null)

  const fetchAnimals = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ competitionId: String(id) })
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    fetch(`/api/competition-animals?${params}`)
      .then(r => r.json())
      .then((data: Animal[]) => {
        setAnimals(data)
        // Mevcut puan/ödül verilerini state'e aktar
        const s: typeof scores = {}
        data.forEach(a => {
          s[a.id] = {
            score: a.individualScore !== null ? String(a.individualScore) : '',
            groupScore: a.collectionGroup?.groupScore !== null ? String(a.collectionGroup?.groupScore ?? '') : '',
            selectedAwards: (() => { try { return JSON.parse(a.awards) } catch { return [] } })(),
          }
        })
        setScores(s)
      })
      .finally(() => setLoading(false))
  }, [id, statusFilter, search])

  useEffect(() => { fetchAnimals() }, [fetchAnimals])
  useEffect(() => {
    fetch('/api/award-types').then(r => r.json()).then(setAwards)
  }, [])

  const handleFedApprove = async (animalId: number) => {
    await fetch(`/api/competition-animals/${animalId}/fed-approve`, { method: 'POST' })
    fetchAnimals()
  }

  const handleReject = async (animalId: number) => {
    const note = prompt('Red nedeni (opsiyonel):') ?? ''
    await fetch(`/api/competition-animals/${animalId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    fetchAnimals()
  }

  const handleBulkApprove = async () => {
    const toApprove = animals.filter(a => a.status === 'assoc_approved')
    await Promise.all(toApprove.map(a => fetch(`/api/competition-animals/${a.id}/fed-approve`, { method: 'POST' })))
    fetchAnimals()
  }

  const handleCageAssign = async () => {
    if (!confirm('Kafes ataması yapılsın mı? Mevcut atamalar sıfırlanacak.')) return
    setAssigning(true)
    setAssignResult(null)
    const res = await fetch(`/api/cage-assignment/${id}`, { method: 'POST' })
    const data = await res.json()
    setAssignResult(data.assigned ? `${data.assigned} hayvana kafes atandı.` : (data.error || 'Hata oluştu'))
    setAssigning(false)
    fetchAnimals()
  }

  const handleSaveScore = async (animal: Animal) => {
    setSaving(animal.id)
    const s = scores[animal.id]
    await fetch(`/api/competition-animals/${animal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        individualScore: s?.score !== '' ? Number(s?.score) : null,
        awards: s?.selectedAwards || [],
      }),
    })
    // Koleksiyon grup puanı
    if (animal.collectionGroup && s?.groupScore !== '') {
      // Tüm grup hayvanlarını güncelle (collectionGroup.groupScore)
      // Basit yaklaşım: collectionGroupId üzerinden güncelle
      await fetch(`/api/collection-groups/${animal.collectionGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupScore: Number(s?.groupScore) }),
      })
    }
    setSaving(null)
    fetchAnimals()
  }

  const toggleAward = (animalId: number, awardName: string) => {
    setScores(prev => {
      const current = prev[animalId]?.selectedAwards || []
      const updated = current.includes(awardName)
        ? current.filter(a => a !== awardName)
        : [...current, awardName]
      return { ...prev, [animalId]: { ...prev[animalId], selectedAwards: updated } }
    })
  }

  const assocApprovedCount = animals.filter(a => a.status === 'assoc_approved').length
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    const res = await fetch(`/api/competitions/${id}/export`)
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cd = res.headers.get('Content-Disposition') || ''
      const match = cd.match(/filename\*=UTF-8''(.+)/)
      a.download = match ? decodeURIComponent(match[1]) : 'yarisma-sonuclari.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    }
    setExporting(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Yarışma Yönetimi</h1>
        <div className="flex gap-2 text-sm">
          <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">{animals.length} hayvan</span>
          <button onClick={handleExport} disabled={exporting}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
            {exporting ? '...' : '📥 Excel İndir'}
          </button>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['hayvanlar', 'puanlar', 'kafes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'hayvanlar' ? 'Hayvan Listesi' : t === 'puanlar' ? 'Puan & Ödül' : 'Kafes Atama'}
          </button>
        ))}
      </div>

      {/* Hayvan Listesi Sekmesi */}
      {tab === 'hayvanlar' && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Dernek veya üye ara..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 w-56" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400">
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Bekliyor</option>
              <option value="assoc_approved">Başkan Onaylı</option>
              <option value="fed_approved">Fed. Onaylı</option>
              <option value="rejected">Reddedildi</option>
            </select>
            {assocApprovedCount > 0 && (
              <button onClick={handleBulkApprove}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Tümünü Fed. Onayla ({assocApprovedCount})
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">Yükleniyor...</div>
          ) : animals.length === 0 ? (
            <div className="py-12 text-center text-gray-400">Kayıt bulunamadı.</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Kafes</th>
                    <th className="px-4 py-3 text-left">Tür / Irk</th>
                    <th className="px-4 py-3 text-left">Cins / Renk</th>
                    <th className="px-4 py-3 text-left">Kimlik</th>
                    <th className="px-4 py-3 text-left">Üye / Dernek</th>
                    <th className="px-4 py-3 text-left">Durum</th>
                    <th className="px-4 py-3 text-left">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {animals.map(a => {
                    const st = STATUS_LABELS[a.status]
                    return (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-bold text-gray-700">
                          {a.cageNumber ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium">{TYPE_LABELS[a.animalType] || a.animalType}</span>
                          {a.breed && <span className="text-gray-400 ml-1 text-xs">({a.breed === 'DEV' ? 'Dev' : 'Cüce'})</span>}
                          {a.entryType === 'COLLECTION' && a.collectionGroup && (
                            <span className="ml-1 text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                              Kol.{a.collectionGroup.groupNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div>{a.species}</div>
                          <div className="text-xs text-gray-400">{a.color}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {a.animalType === 'TAVSAN'
                            ? (a.chipNumber ? `Cip: ${a.chipNumber}` : '—')
                            : (a.braceletYear ? `${a.braceletYear}/${a.braceletNumber || '—'}` : '—')
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{a.member.name}</div>
                          <div className="text-xs text-gray-400">{a.member.association.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${st?.color}`}>{st?.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {a.status === 'assoc_approved' && (
                              <button onClick={() => handleFedApprove(a.id)}
                                className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">Onayla</button>
                            )}
                            {(a.status === 'pending' || a.status === 'assoc_approved') && (
                              <button onClick={() => handleReject(a.id)}
                                className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100">Reddet</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Puan & Ödül Sekmesi */}
      {tab === 'puanlar' && (
        <div className="space-y-3">
          {animals.filter(a => a.status === 'fed_approved').length === 0 ? (
            <div className="py-12 text-center text-gray-400">Federasyon onaylı hayvan bulunmuyor.</div>
          ) : (
            animals.filter(a => a.status === 'fed_approved').map(a => {
              const s = scores[a.id] || { score: '', groupScore: '', selectedAwards: [] }
              return (
                <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="font-bold text-gray-800">
                        {a.cageNumber ? `Kafes ${a.cageNumber} — ` : ''}{TYPE_LABELS[a.animalType]} {a.breed === 'DEV' ? '(Dev)' : a.breed === 'CUCE' ? '(Cüce)' : ''}
                      </div>
                      <div className="text-sm text-gray-500">{a.species} / {a.color}</div>
                      {a.entryType === 'COLLECTION' && a.collectionGroup && (
                        <div className="text-xs text-purple-600 mt-0.5">Koleksiyon {a.collectionGroup.groupNumber}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleSaveScore(a)}
                      disabled={saving === a.id}
                      className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {saving === a.id ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Bireysel Puan</label>
                      <input
                        type="number"
                        value={s.score}
                        onChange={e => setScores(prev => ({ ...prev, [a.id]: { ...prev[a.id], score: e.target.value } }))}
                        placeholder="0 - 100"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    </div>
                    {a.entryType === 'COLLECTION' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Grup Puanı</label>
                        <input
                          type="number"
                          value={s.groupScore}
                          onChange={e => setScores(prev => ({ ...prev, [a.id]: { ...prev[a.id], groupScore: e.target.value } }))}
                          placeholder="Koleksiyon grup puanı"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Ödüller</p>
                    <div className="flex flex-wrap gap-2">
                      {awards.map(award => (
                        <label key={award.id} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={s.selectedAwards.includes(award.name)}
                            onChange={() => toggleAward(a.id, award.name)}
                            className="w-3.5 h-3.5 text-primary-600"
                          />
                          <span className="text-xs text-gray-700">{award.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Kafes Atama Sekmesi */}
      {tab === 'kafes' && (
        <div className="max-w-xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-700 mb-2">Kafes Ataması</h2>
            <p className="text-sm text-gray-500 mb-4">
              Federasyon onaylı tüm hayvanlara otomatik kafes numarası atanır.
              Sıralama: Dev Horoz/Tavuk → Cüce → Güvercin → Bıldırcın → Tavşan → Ördek → Kaz
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-xs text-amber-800">
              Mevcut kafes atamaları sıfırlanacak ve yeniden atama yapılacak.
            </div>

            <button
              onClick={handleCageAssign}
              disabled={assigning}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {assigning ? 'Atama Yapılıyor...' : 'Kafes Ataması Yap'}
            </button>

            {assignResult && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {assignResult}
              </div>
            )}

            {/* Mevcut atamalar */}
            {animals.filter(a => a.cageNumber !== null).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Mevcut Kafes Atamaları</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {animals
                    .filter(a => a.cageNumber !== null)
                    .sort((a, b) => (a.cageNumber ?? 0) - (b.cageNumber ?? 0))
                    .map(a => (
                      <div key={a.id} className="flex items-center gap-3 text-xs py-1 border-b border-gray-50">
                        <span className="font-mono font-bold w-8 text-gray-700">{a.cageNumber}</span>
                        <span className="text-gray-600">{TYPE_LABELS[a.animalType]} {a.breed === 'DEV' ? '(Dev)' : a.breed === 'CUCE' ? '(C)' : ''}</span>
                        <span className="text-gray-400">{a.species} / {a.color}</span>
                        {a.entryType === 'COLLECTION' && a.collectionGroup && (
                          <span className="text-purple-500">Kol.{a.collectionGroup.groupNumber}</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
