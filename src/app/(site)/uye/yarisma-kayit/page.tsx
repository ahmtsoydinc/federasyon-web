'use client'

import { useEffect, useState, useCallback } from 'react'

const ANIMAL_TYPES = [
  { value: 'TAVUK', label: 'Tavuk' },
  { value: 'HOROZ', label: 'Horoz' },
  { value: 'ORDEK', label: 'Ördek' },
  { value: 'GUVERCIN', label: 'Güvercin' },
  { value: 'TAVSAN', label: 'Tavşan' },
  { value: 'KAZ', label: 'Kaz' },
  { value: 'HINDI', label: 'Hindi' },
  { value: 'BILDIRCIN', label: 'Bıldırcın' },
]

const BREEDS = [{ value: 'DEV', label: 'Dev' }, { value: 'CUCE', label: 'Cüce' }]

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Taslak', color: 'text-gray-600 bg-gray-100' },
  submitted: { label: 'Başkan Onayı Bekleniyor', color: 'text-amber-600 bg-amber-50' },
  assoc_approved: { label: 'Federasyon Onayı Bekleniyor', color: 'text-blue-600 bg-blue-50' },
  fed_approved: { label: 'Onaylandı', color: 'text-green-600 bg-green-50' },
  rejected: { label: 'Reddedildi', color: 'text-red-600 bg-red-50' },
}

const TYPE_LABELS: Record<string, string> = {
  TAVUK: 'Tavuk', HOROZ: 'Horoz', ORDEK: 'Ördek', GUVERCIN: 'Güvercin',
  TAVSAN: 'Tavşan', KAZ: 'Kaz', HINDI: 'Hindi', BILDIRCIN: 'Bıldırcın',
}

const currentYear = new Date().getFullYear()
const BRACELET_YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i)
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']

function hasBreed(type: string) { return type === 'TAVUK' || type === 'HOROZ' || type === 'TAVSAN' }
function hasGender(type: string) { return !['TAVUK', 'HOROZ'].includes(type) }
function isTavsan(type: string) { return type === 'TAVSAN' }

type FormData = {
  animalType: string; breed: string; gender: string; species: string; color: string
  braceletYear: string; braceletNumber: string
  chipNumber: string; tattooLeftEar: string; tattooRightEar: string
  birthMonth: string; birthYear: string
  entryType: string; collectionGroupId: string
}

const EMPTY_FORM: FormData = {
  animalType: 'TAVUK', breed: '', gender: '', species: '', color: '',
  braceletYear: String(currentYear), braceletNumber: '',
  chipNumber: '', tattooLeftEar: '', tattooRightEar: '',
  birthMonth: '', birthYear: '', entryType: 'SINGLE', collectionGroupId: '',
}

export default function YarismaKayitPage() {
  const [competition, setCompetition] = useState<any>(null)
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [animals, setAnimals] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [speciesList, setSpeciesList] = useState<string[]>([])
  const [colorList, setColorList] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [submitAllLoading, setSubmitAllLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [lockedSpecies, setLockedSpecies] = useState<string | null>(null)
  const [lockedColor, setLockedColor] = useState<string | null>(null)
  const [formStep, setFormStep] = useState<'select' | 'form'>('select')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailGroupId, setDetailGroupId] = useState<number | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showRegulationModal, setShowRegulationModal] = useState(false)
  const [regulationAccepted, setRegulationAccepted] = useState(false)

  const fetchData = useCallback(async () => {
    const [compRes, animRes, grpRes] = await Promise.all([
      fetch('/api/competitions/active'),
      fetch('/api/competition-animals'),
      fetch('/api/collection-groups'),
    ])
    const compData = await compRes.json()
    const animData = await animRes.json()
    const grpData = await grpRes.json()

    setCompetition(compData.competition)
    setRegistrationOpen(compData.registrationOpen ?? false)
    if (compData.competition) {
      setAnimals(Array.isArray(animData) ? animData.filter((a: any) => a.competitionId === compData.competition.id) : [])
      setGroups(Array.isArray(grpData) ? grpData.filter((g: any) => g.competitionId === compData.competition.id) : [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Cins listesi yükle
  useEffect(() => {
    if (!form.animalType) return
    const params = new URLSearchParams({ animalType: form.animalType, distinct: 'species' })
    if (hasBreed(form.animalType) && form.breed) params.set('breed', form.breed)
    fetch(`/api/animal-standards?${params}`)
      .then(r => r.json())
      .then(data => { setSpeciesList(Array.isArray(data) ? data : []); setForm(f => ({ ...f, species: '', color: '' })) })
  }, [form.animalType, form.breed])

  // Renk listesi yükle
  useEffect(() => {
    if (!form.animalType || !form.species) return
    const params = new URLSearchParams({ animalType: form.animalType, species: form.species })
    if (hasBreed(form.animalType) && form.breed) params.set('breed', form.breed)
    fetch(`/api/animal-standards?${params}`)
      .then(r => r.json())
      .then(data => { setColorList(Array.isArray(data) ? data : []); setForm(f => ({ ...f, color: '' })) })
  }, [form.animalType, form.breed, form.species])

  // Koleksiyon grubu seçilince cins ve rengi kilitle
  useEffect(() => {
    if (!form.collectionGroupId) { setLockedSpecies(null); setLockedColor(null); return }
    const groupAnimals = animals.filter(a => a.collectionGroupId === parseInt(form.collectionGroupId))
    if (groupAnimals.length > 0) {
      const sp = groupAnimals[0].species
      const cl = groupAnimals[0].color
      setLockedSpecies(sp)
      setLockedColor(cl)
      setForm(f => ({ ...f, species: sp, color: cl }))
    } else {
      setLockedSpecies(null)
      setLockedColor(null)
    }
  }, [form.collectionGroupId, animals])

  const openAdd = (entryType?: string, groupId?: number) => {
    setEditId(null)
    const initForm: FormData = { ...EMPTY_FORM }
    if (entryType) {
      initForm.entryType = entryType
      if (groupId) initForm.collectionGroupId = String(groupId)
    }
    setForm(initForm)
    setError('')
    setLockedSpecies(null)
    setLockedColor(null)
    setFormStep(entryType ? 'form' : 'select')
    setShowModal(true)
  }

  const openEdit = (animal: any) => {
    setEditId(animal.id)
    setForm({
      animalType: animal.animalType, breed: animal.breed || '', gender: animal.gender || '',
      species: animal.species, color: animal.color,
      braceletYear: animal.braceletYear ? String(animal.braceletYear) : String(currentYear),
      braceletNumber: animal.braceletNumber || '',
      chipNumber: animal.chipNumber || '', tattooLeftEar: animal.tattooLeftEar || '',
      tattooRightEar: animal.tattooRightEar || '',
      birthMonth: animal.birthMonth ? String(animal.birthMonth) : '',
      birthYear: animal.birthYear ? String(animal.birthYear) : '',
      entryType: animal.entryType || 'SINGLE',
      collectionGroupId: animal.collectionGroupId ? String(animal.collectionGroupId) : '',
    })
    setError('')
    setLockedSpecies(null)
    setLockedColor(null)
    setFormStep('form')
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu hayvanı silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/competition-animals/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const handleSubmitAnimal = async () => {
    setError('')
    setSubmitting(true)

    // Koleksiyon grubu: yoksa yeni oluştur
    let groupId = form.collectionGroupId ? parseInt(form.collectionGroupId) : null
    if (form.entryType === 'COLLECTION' && !groupId) {
      const grpRes = await fetch('/api/collection-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId: competition.id }),
      })
      const grpData = await grpRes.json()
      groupId = grpData.id
    }

    const payload = {
      ...form,
      competitionId: competition.id,
      collectionGroupId: groupId,
      braceletYear: form.braceletYear ? parseInt(form.braceletYear) : null,
      birthMonth: form.birthMonth ? parseInt(form.birthMonth) : null,
      birthYear: form.birthYear ? parseInt(form.birthYear) : null,
    }

    const url = editId ? `/api/competition-animals/${editId}` : '/api/competition-animals'
    const method = editId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error || 'Hata oluştu'); return }
    setShowModal(false)
    fetchData()
  }

  const handleSubmitAll = () => {
    const pending = animals.filter(a => a.status === 'pending')
    if (pending.length === 0) return
    setRegulationAccepted(false)
    setShowReviewModal(true)
  }

  const doSubmitAll = async () => {
    setShowRegulationModal(false)
    setShowReviewModal(false)
    setSubmitAllLoading(true)
    await fetch('/api/competition-animals/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competitionId: competition.id }),
    })
    setSubmitAllLoading(false)
    setSubmitted(true)
    setRegulationAccepted(false)
    fetchData()
  }

  const setF = (key: keyof FormData, value: string) => setForm(f => ({ ...f, [key]: value }))

  if (loading) return <div className="py-20 text-center text-gray-400">Yükleniyor...</div>

  if (!competition) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🏆</div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">Aktif Yarışma Yok</h2>
      <p className="text-gray-500">Şu an aktif bir yarışma bulunmamaktadır.</p>
    </div>
  )

  if (!registrationOpen) return (
    <div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-xl">🔒</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">{competition.name}</p>
          <p className="text-xs text-amber-600">
            Kayıt dönemi: {new Date(competition.registrationStart).toLocaleDateString('tr-TR')} — {new Date(competition.registrationEnd).toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>
      {animals.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🐣</div>
          <p>Bu yarışmaya kayıtlı hayvan bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {animals.map(a => {
            const st = STATUS_MAP[a.status]
            const awardsArr: string[] = (() => { try { return JSON.parse(a.awards || '[]') } catch { return [] } })()
            return (
              <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800">{TYPE_LABELS[a.animalType]}</span>
                      {a.breed && <span className="text-xs text-gray-500">({a.breed === 'DEV' ? 'Dev' : 'Cüce'})</span>}
                      {a.gender && <span className="text-xs text-gray-500">{a.gender === 'ERKEK' ? 'Erkek' : 'Dişi'}</span>}
                      {a.entryType === 'COLLECTION' && a.collectionGroup && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                          Koleksiyon {a.collectionGroup.groupNumber}
                        </span>
                      )}
                      {a.cageNumber && (
                        <span className="text-xs bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded-full">
                          Kafes {a.cageNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">{a.species} / {a.color}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {a.animalType === 'TAVSAN'
                        ? (a.chipNumber ? `Cip: ${a.chipNumber}` : `Dövme: ${a.tattooLeftEar} / ${a.tattooRightEar}`)
                        : (a.braceletYear ? `${a.braceletYear} / ${a.braceletNumber || '—'}` : '')
                      }
                    </div>
                    {a.individualScore !== null && a.individualScore !== undefined && (
                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-semibold text-primary-700">Puan: {a.individualScore}</span>
                        {a.collectionGroup?.groupScore !== null && a.collectionGroup?.groupScore !== undefined && (
                          <span className="text-sm text-gray-600">Grup Puanı: {a.collectionGroup.groupScore}</span>
                        )}
                      </div>
                    )}
                    {awardsArr.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {awardsArr.map((aw, i) => (
                          <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                            🏆 {aw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${st?.color}`}>{st?.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const pendingCount = animals.filter(a => a.status === 'pending').length
  const submittedCount = animals.filter(a => a.status === 'submitted').length

  // Eksik koleksiyon grupları (4'ten az hayvan içeren)
  const incompleteGroups = groups
    .map(g => ({
      ...g,
      animalCount: animals.filter(a => a.collectionGroupId === g.id).length,
    }))
    .filter(g => g.animalCount > 0 && g.animalCount < 4)

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{competition.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kayıt bitiş: {new Date(competition.registrationEnd).toLocaleDateString('tr-TR')}
          </p>
        </div>
        <button onClick={() => openAdd()}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
          + Hayvan Ekle
        </button>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-green-700 text-sm">
          Hayvanlarınız dernek başkanının onayına gönderildi. Onay durumunu aşağıdan takip edebilirsiniz.
        </div>
      )}

      {/* Koleksiyon Grupları */}
      {groups.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Koleksiyonlarım</h3>
          <div className="space-y-2">
            {groups.map(g => {
              const groupAnimals = animals.filter(a => a.collectionGroupId === g.id)
              const count = groupAnimals.length
              const firstAnimal = groupAnimals[0]
              const isComplete = count >= 4
              return (
                <div key={g.id} className={`bg-white rounded-xl border p-3 ${isComplete ? 'border-green-200 bg-green-50/30' : 'border-amber-200'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 text-sm">Koleksiyon {g.groupNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {count}/4 hayvan
                        </span>
                        {isComplete && <span className="text-xs text-green-600">✓ Tam</span>}
                      </div>
                      {firstAnimal && (
                        <div className="text-xs text-gray-500 mt-0.5">{TYPE_LABELS[firstAnimal.animalType]} · {firstAnimal.species} / {firstAnimal.color}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {count < 4 && (
                        <button onClick={() => openAdd('COLLECTION', g.id)}
                          className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                          + Hayvan Ekle
                        </button>
                      )}
                      <button onClick={() => { setDetailGroupId(g.id); setShowDetailModal(true) }}
                        className="text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        Detay
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <button onClick={() => openAdd('COLLECTION')}
            className="mt-2 w-full text-xs text-primary-600 border border-dashed border-primary-300 rounded-xl py-2 hover:bg-primary-50 transition-colors">
            + Yeni Koleksiyon Oluştur
          </button>
        </div>
      )}

      {animals.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🐣</div>
          <p>Henüz hayvan eklenmedi.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {animals.map(a => {
              const st = STATUS_MAP[a.status]
              const awardsArr: string[] = (() => { try { return JSON.parse(a.awards || '[]') } catch { return [] } })()
              return (
                <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800">{TYPE_LABELS[a.animalType]}</span>
                        {a.breed && <span className="text-xs text-gray-500">({a.breed === 'DEV' ? 'Dev' : 'Cüce'})</span>}
                        {a.gender && <span className="text-xs text-gray-500">{a.gender === 'ERKEK' ? 'Erkek' : 'Dişi'}</span>}
                        {a.entryType === 'COLLECTION' && a.collectionGroup && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                            Koleksiyon {a.collectionGroup.groupNumber}
                          </span>
                        )}
                        {a.cageNumber && (
                          <span className="text-xs bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded-full">
                            Kafes {a.cageNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">{a.species} / {a.color}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {a.animalType === 'TAVSAN'
                          ? (a.chipNumber ? `Cip: ${a.chipNumber}` : `Dövme: ${a.tattooLeftEar} / ${a.tattooRightEar}`)
                          : (a.braceletYear ? `${a.braceletYear} / ${a.braceletNumber || '—'}` : '')
                        }
                      </div>
                      {a.individualScore !== null && a.individualScore !== undefined && (
                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-semibold text-primary-700">Puan: {a.individualScore}</span>
                          {a.collectionGroup?.groupScore !== null && a.collectionGroup?.groupScore !== undefined && (
                            <span className="text-sm text-gray-600">Grup Puanı: {a.collectionGroup.groupScore}</span>
                          )}
                        </div>
                      )}
                      {awardsArr.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {awardsArr.map((aw, i) => (
                            <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                              🏆 {aw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st?.color}`}>{st?.label}</span>
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => openEdit(a)} className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1">Düzenle</button>
                          <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1">Sil</button>
                        </>
                      )}
                      {a.status === 'submitted' && (
                        <span className="text-xs text-gray-400 italic">Gönderildi 🔒</span>
                      )}
                      {a.status === 'rejected' && a.rejectionNote && (
                        <span className="text-xs text-red-600 max-w-[160px] truncate" title={a.rejectionNote}>Red: {a.rejectionNote}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {incompleteGroups.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
              <p className="text-sm font-semibold text-red-700 mb-2">Eksik Koleksiyon Grubu</p>
              {incompleteGroups.map(g => (
                <p key={g.id} className="text-sm text-red-600">
                  Koleksiyon {g.groupNumber}: {g.animalCount}/4 hayvan — {4 - g.animalCount} hayvan daha eklenmeli
                </p>
              ))}
            </div>
          )}

          {submittedCount > 0 && pendingCount === 0 && !submitted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700">
                ✅ <strong>{submittedCount}</strong> hayvanınız başkanın onayına gönderildi. Onay bekleniyor.
              </p>
            </div>
          )}

          {pendingCount > 0 && !submitted && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 mb-1">
                <strong>{pendingCount}</strong> taslak hayvanınız var.
                {submittedCount > 0 && <span className="text-amber-600"> ({submittedCount} hayvan zaten gönderildi.)</span>}
              </p>
              <p className="text-xs text-amber-700 mb-3">Gönderdikten sonra düzenleme ve silme işlemi yapılamaz.</p>
              <button
                onClick={handleSubmitAll}
                disabled={submitAllLoading || incompleteGroups.length > 0}
                title={incompleteGroups.length > 0 ? 'Eksik koleksiyon grupları tamamlanmalı' : ''}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitAllLoading ? 'Gönderiliyor...' : 'Listeyi Onayla ve Başkana Gönder'}
              </button>
              {incompleteGroups.length > 0 && (
                <p className="text-xs text-red-600 mt-2">Göndermeden önce tüm koleksiyon gruplarını 4 hayvana tamamlayın.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Hayvan Ekle/Düzenle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!editId && formStep === 'form' && (
                  <button onClick={() => setFormStep('select')} className="text-gray-400 hover:text-gray-700 text-sm mr-1">← Geri</button>
                )}
                <h2 className="font-bold text-gray-800">
                  {editId ? 'Hayvanı Düzenle' : formStep === 'select' ? 'Kayıt Türünü Seçin' : form.entryType === 'COLLECTION' ? '🏆 Koleksiyona Ekle' : '🐦 Tek Hayvan Ekle'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* ADIM 1: Kayıt türü seç */}
            {!editId && formStep === 'select' && (
              <div className="p-5 space-y-3">
                <p className="text-xs text-gray-500">Bu hayvanı nasıl kaydetmek istiyorsunuz?</p>
                <button
                  onClick={() => { setF('entryType', 'SINGLE'); setFormStep('form') }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-left">
                  <span className="text-3xl">🐦</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Tek Hayvan</div>
                    <div className="text-xs text-gray-500 mt-0.5">Bireysel yarışma kaydı</div>
                  </div>
                </button>
                <button
                  onClick={() => { setF('entryType', 'COLLECTION'); setF('collectionGroupId', ''); setFormStep('form') }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left">
                  <span className="text-3xl">🏆</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Koleksiyona Ekle</div>
                    <div className="text-xs text-gray-500 mt-0.5">Grup koleksiyon yarışması (4 hayvan)</div>
                  </div>
                </button>
              </div>
            )}

            {(editId || formStep === 'form') && (
            <div className="p-5 space-y-4">
              {/* Tür */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Tür *</label>
                <div className="grid grid-cols-4 gap-2">
                  {ANIMAL_TYPES.map(t => (
                    <button key={t.value} onClick={() => setF('animalType', t.value)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors ${form.animalType === t.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Irk (Tavuk, Horoz, Tavşan) */}
              {hasBreed(form.animalType) && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Irk *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BREEDS.map(b => (
                      <button key={b.value} onClick={() => setF('breed', b.value)}
                        className={`py-2 text-xs font-medium rounded-lg border transition-colors ${form.breed === b.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cinsiyet (Horoz/Tavuk hariç) */}
              {hasGender(form.animalType) && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Cinsiyet *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setF('gender', 'ERKEK')}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors ${form.gender === 'ERKEK' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>
                      {form.animalType === 'ORDEK' ? 'Erkek (Suna)' : 'Erkek'}
                    </button>
                    <button onClick={() => setF('gender', 'DISI')}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors ${form.gender === 'DISI' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>
                      Dişi
                    </button>
                  </div>
                </div>
              )}

              {/* Cins */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cins *</label>
                {lockedSpecies ? (
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 flex items-center justify-between">
                    <span>{lockedSpecies}</span>
                    <span className="text-xs text-gray-400">🔒 Koleksiyon cinsi</span>
                  </div>
                ) : (
                  <select value={form.species} onChange={e => setF('species', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white">
                    <option value="">{speciesList.length === 0 ? 'Standart verisi yükleniyor...' : 'Seçiniz'}</option>
                    {speciesList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>

              {/* Renk */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Renk *</label>
                {lockedColor ? (
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 flex items-center justify-between">
                    <span>{lockedColor}</span>
                    <span className="text-xs text-gray-400">🔒 Koleksiyon rengi</span>
                  </div>
                ) : (
                  <select value={form.color} onChange={e => setF('color', e.target.value)}
                    disabled={!form.species}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white disabled:opacity-50">
                    <option value="">Seçiniz</option>
                    {colorList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>

              {/* Kimlik bilgileri */}
              {isTavsan(form.animalType) ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Doğum Tarihi *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={form.birthMonth} onChange={e => setF('birthMonth', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white">
                        <option value="">Ay seçin</option>
                        {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                      </select>
                      <input type="number" value={form.birthYear} onChange={e => setF('birthYear', e.target.value)}
                        placeholder="Yıl (örn: 2023)"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cip Numarası (15 hane)</label>
                    <input value={form.chipNumber} onChange={e => setF('chipNumber', e.target.value)}
                      maxLength={15} placeholder="15 haneli cip numarası"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Dövme Numarası</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={form.tattooLeftEar} onChange={e => setF('tattooLeftEar', e.target.value)}
                        maxLength={6} placeholder="Sol kulak (6 hane)"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                      <input value={form.tattooRightEar} onChange={e => setF('tattooRightEar', e.target.value)}
                        maxLength={7} placeholder="Sağ kulak (7 hane)"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bilezik Bilgileri *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={form.braceletYear} onChange={e => setF('braceletYear', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white">
                      {BRACELET_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <input value={form.braceletNumber} onChange={e => setF('braceletNumber', e.target.value)}
                      placeholder="Bilezik numarası"
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                  </div>
                </div>
              )}

              {/* Tek / Koleksiyon */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Kayıt Türü *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setF('entryType', 'SINGLE')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${form.entryType === 'SINGLE' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>
                    Tek
                  </button>
                  <button onClick={() => { setF('entryType', 'COLLECTION'); setF('collectionGroupId', '') }}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${form.entryType === 'COLLECTION' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>
                    Koleksiyon
                  </button>
                </div>
              </div>

              {form.entryType === 'COLLECTION' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Koleksiyon Grubu</label>
                  <select value={form.collectionGroupId} onChange={e => setF('collectionGroupId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white">
                    <option value="">Yeni Koleksiyon Oluştur</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        Koleksiyon {g.groupNumber} ({g.animals?.length || 0}/4 hayvan)
                      </option>
                    ))}
                  </select>
                  {/* Koleksiyon Şartları Kutusu */}
                  <div className="mt-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-amber-600 text-base">⚠️</span>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Koleksiyon Şartları</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      {[
                        { label: '2 Erkek', sub: '2 Dişi' },
                        { label: '1 Dişi', sub: '3 Erkek' },
                        { label: '3 Dişi', sub: '1 Erkek' },
                      ].map((c, i) => (
                        <div key={i} className="bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-center">
                          <div className="text-xs font-bold text-amber-800">{c.label}</div>
                          <div className="text-xs text-amber-600">+ {c.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                      <span>🐾</span>
                      <span>Maksimum <strong>4 hayvan</strong> — aynı cins ve renk zorunlu</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
              )}
            </div>
            )}

            {(editId || formStep === 'form') && (
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3">
              <button onClick={handleSubmitAnimal} disabled={submitting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {submitting ? 'Kaydediliyor...' : (editId ? 'Güncelle' : 'Ekle')}
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-5 text-gray-600 hover:text-gray-800 text-sm py-2.5">
                İptal
              </button>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Detay Modalı */}
      {showDetailModal && detailGroupId !== null && (() => {
        const detailGroup = groups.find(g => g.id === detailGroupId)
        const detailAnimals = animals.filter(a => a.collectionGroupId === detailGroupId)
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full sm:rounded-2xl sm:max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                <h2 className="font-bold text-gray-800">Koleksiyon {detailGroup?.groupNumber} — Detay</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${detailAnimals.length >= 4 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {detailAnimals.length}/4 hayvan
                  </span>
                  {detailAnimals[0] && (
                    <span className="text-xs text-gray-500">{detailAnimals[0].species} / {detailAnimals[0].color}</span>
                  )}
                </div>
                {detailAnimals.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Henüz hayvan eklenmedi.</p>
                ) : (
                  <div className="space-y-2">
                    {detailAnimals.map((a, i) => (
                      <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800">
                            {TYPE_LABELS[a.animalType]}
                            {a.breed ? ` (${a.breed === 'DEV' ? 'Dev' : 'Cüce'})` : ''}
                            {a.gender ? ` · ${a.gender === 'ERKEK' ? 'Erkek' : 'Dişi'}` : ''}
                          </div>
                          <div className="text-xs text-gray-500">{a.species} / {a.color}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_MAP[a.status]?.color}`}>
                          {STATUS_MAP[a.status]?.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {detailAnimals.length < 4 && (
                  <button
                    onClick={() => { setShowDetailModal(false); openAdd('COLLECTION', detailGroupId) }}
                    className="mt-4 w-full bg-primary-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
                    + Hayvan Ekle ({4 - detailAnimals.length} daha gerekli)
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* İnceleme Modalı */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">📋 Kayıt Listesini İncele</h2>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-5">
              {/* Tek hayvanlar */}
              {animals.filter(a => a.status === 'pending' && a.entryType === 'SINGLE').length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Tek Hayvanlar ({animals.filter(a => a.status === 'pending' && a.entryType === 'SINGLE').length})
                  </div>
                  <div className="space-y-1.5">
                    {animals.filter(a => a.status === 'pending' && a.entryType === 'SINGLE').map((a, i) => (
                      <div key={a.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg text-sm">
                        <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <span className="font-medium text-gray-800">{TYPE_LABELS[a.animalType]}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-600">{a.species} / {a.color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Koleksiyonlar */}
              {groups.filter(g => animals.some(a => a.collectionGroupId === g.id && a.status === 'pending')).map(g => {
                const gAnimals = animals.filter(a => a.collectionGroupId === g.id && a.status === 'pending')
                return (
                  <div key={g.id}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Koleksiyon {g.groupNumber} ({gAnimals.length}/4)
                    </div>
                    <div className="space-y-1.5">
                      {gAnimals.map((a, i) => (
                        <div key={a.id} className="flex items-center gap-2 p-2.5 bg-purple-50 rounded-lg text-sm">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <span className="font-medium text-gray-800">
                            {TYPE_LABELS[a.animalType]}
                            {a.gender ? ` · ${a.gender === 'ERKEK' ? 'Erkek' : 'Dişi'}` : ''}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-600">{a.species} / {a.color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              <div className="pt-2">
                <button
                  onClick={() => { setShowReviewModal(false); setRegulationAccepted(false); setShowRegulationModal(true) }}
                  className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors">
                  Devam Et → Yönetmeliği Onayla
                </button>
                <button onClick={() => setShowReviewModal(false)} className="w-full text-gray-500 text-sm mt-2 py-2">
                  Geri Dön
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sergi Yönetmeliği Onay Modalı */}
      {showRegulationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Sergi Yönetmeliği</h2>
              <button onClick={() => setShowRegulationModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-4">
              {competition?.regulationDocument?.fileUrl ? (
                <iframe
                  src={competition.regulationDocument.fileUrl}
                  className="w-full h-72 rounded-xl border border-gray-200"
                  title="Sergi Yönetmeliği"
                />
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  ℹ️ Sergi yönetmeliği belgesi henüz yüklenmemiş. Yönetmeligi teyit ederek devam edebilirsiniz.
                </div>
              )}
              <label className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={regulationAccepted}
                  onChange={e => setRegulationAccepted(e.target.checked)}
                  className="mt-0.5 flex-shrink-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-amber-900 leading-relaxed">
                  Sergi yönetmeliğini okudum, anladım ve tüm şartlarını kabul ediyorum. Gönderilen kayıtlarda düzenleme yapılamayacağını biliyorum.
                </span>
              </label>
              <button
                onClick={doSubmitAll}
                disabled={!regulationAccepted || submitAllLoading}
                className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {submitAllLoading ? 'Gönderiliyor...' : 'Onayla ve Başkana Gönder'}
              </button>
              <button onClick={() => { setShowRegulationModal(false); setShowReviewModal(true) }} className="w-full text-gray-500 text-sm py-1.5">
                ← Geri
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
