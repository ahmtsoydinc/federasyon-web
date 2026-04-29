'use client'

import { useState } from 'react'

const TYPE_LABELS: Record<string, string> = {
  TAVUK: 'Tavuk', HOROZ: 'Horoz', ORDEK: 'Ördek', GUVERCIN: 'Güvercin',
  TAVSAN: 'Tavşan', KAZ: 'Kaz', HINDI: 'Hindi', BILDIRCIN: 'Bıldırcın',
}

interface AnimalInfo {
  id: number
  animalType: string
  breed: string | null
  gender: string | null
  species: string
  color: string
  braceletYear: number | null
  braceletNumber: string | null
  entryType: string
  cageNumber: number
  individualScore: number | null
  judgeStrengths: string | null
  judgeRecommendations: string | null
  collectionGroup: { groupNumber: number; groupScore: number | null } | null
}

export default function HakemPage() {
  const [cageInput, setCageInput] = useState('')
  const [animal, setAnimal] = useState<AnimalInfo | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [searching, setSearching] = useState(false)

  const [braceletNumber, setBraceletNumber] = useState('')
  const [strengths, setStrengths] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [score, setScore] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cageInput.trim()) return
    setSearching(true)
    setNotFound(false)
    setAnimal(null)
    setSaved(false)
    setSaveError('')

    const res = await fetch(`/api/hakem/cage/${cageInput.trim()}`)
    setSearching(false)

    if (res.status === 404) { setNotFound(true); return }
    if (!res.ok) { setNotFound(true); return }

    const data: AnimalInfo = await res.json()
    setAnimal(data)
    setBraceletNumber(data.braceletNumber || '')
    setStrengths(data.judgeStrengths || '')
    setRecommendations(data.judgeRecommendations || '')
    setScore(data.individualScore !== null ? String(data.individualScore) : '')
  }

  const handleSave = async () => {
    if (!animal) return
    setSaving(true)
    setSaveError('')

    const res = await fetch(`/api/hakem/cage/${animal.cageNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        braceletNumber,
        judgeStrengths: strengths,
        judgeRecommendations: recommendations,
        individualScore: score,
      }),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setSaveError(data.error || 'Kayıt başarısız')
      return
    }

    setSaved(true)
    // EE sayfasına (hakem ana sayfa = değerlendirme giriş sayfası) yönlendir
    setTimeout(() => {
      setAnimal(null)
      setCageInput('')
      setSaved(false)
      setBraceletNumber('')
      setStrengths('')
      setRecommendations('')
      setScore('')
    }, 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Kafes Sorgulama</h1>
      <p className="text-gray-500 text-sm mb-6">Kafes numarasını girerek hayvana ait bilgilere ulaşın ve değerlendirmenizi kaydedin.</p>

      {/* Arama formu */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="number"
          value={cageInput}
          onChange={e => setCageInput(e.target.value)}
          placeholder="Kafes numarası girin..."
          min={1}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400 text-lg font-mono"
        />
        <button type="submit" disabled={searching || !cageInput.trim()}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
          {searching ? '...' : 'Sorgula'}
        </button>
      </form>

      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
          Kafes numarası bulunamadı veya henüz atama yapılmamış.
        </div>
      )}

      {animal && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {/* Hayvan bilgileri */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                {animal.animalType === 'TAVUK' ? '🐔' : animal.animalType === 'HOROZ' ? '🐓' : animal.animalType === 'GUVERCIN' ? '🕊' : animal.animalType === 'TAVSAN' ? '🐇' : '🐦'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-800 text-lg">Kafes {animal.cageNumber}</span>
                  {animal.entryType === 'COLLECTION' && animal.collectionGroup && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                      Koleksiyon {animal.collectionGroup.groupNumber}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700 mt-1">
                  {TYPE_LABELS[animal.animalType] || animal.animalType}
                  {animal.breed && <span className="text-gray-500 font-normal ml-1">({animal.breed === 'DEV' ? 'Dev' : 'Cüce'})</span>}
                  {animal.gender && <span className="text-gray-500 font-normal ml-1">· {animal.gender === 'ERKEK' ? 'Erkek' : 'Dişi'}</span>}
                </div>
                <div className="text-sm text-gray-600">{animal.species} / {animal.color}</div>
              </div>
            </div>
          </div>

          {/* Düzenlenebilir alanlar */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bilezik Numarası</label>
              <input value={braceletNumber} onChange={e => setBraceletNumber(e.target.value)}
                placeholder="Bilezik numarası"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Güçlü Yanlar</label>
              <textarea value={strengths} onChange={e => setStrengths(e.target.value)}
                rows={3} placeholder="Hayvanın güçlü yanlarını yazın..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tavsiye</label>
              <textarea value={recommendations} onChange={e => setRecommendations(e.target.value)}
                rows={3} placeholder="Tavsiye ve önerilerinizi yazın..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Puan</label>
              <input type="number" value={score} onChange={e => setScore(e.target.value)}
                placeholder="0 — 100" min={0} max={100}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
          </div>

          {saveError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{saveError}</div>
          )}

          {saved && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium text-center">
              Değerlendirme kaydedildi.
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving || saved}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
              {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
            </button>
            <button onClick={() => { setAnimal(null); setCageInput(''); setSaved(false) }}
              className="px-4 text-gray-500 hover:text-gray-700 text-sm py-3">
              Temizle
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
