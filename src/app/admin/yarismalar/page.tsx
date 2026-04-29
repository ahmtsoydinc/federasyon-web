'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Competition {
  id: number
  name: string
  location: string | null
  registrationStart: string
  registrationEnd: string
  eventDate: string | null
  isActive: boolean
  _count: { animals: number }
}

type FormState = {
  name: string; location: string; registrationStart: string
  registrationEnd: string; eventDate: string; isActive: boolean
}

const EMPTY_FORM: FormState = {
  name: '', location: '', registrationStart: '', registrationEnd: '', eventDate: '', isActive: true,
}

function toLocalDT(iso: string) {
  // ISO → datetime-local input formatı (YYYY-MM-DDTHH:mm)
  return iso ? iso.slice(0, 16) : ''
}

export default function YarismalarPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchAll = () => {
    setLoading(true)
    fetch('/api/competitions')
      .then(r => r.json())
      .then(setCompetitions)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (c: Competition) => {
    setEditId(c.id)
    setForm({
      name: c.name,
      location: c.location || '',
      registrationStart: toLocalDT(c.registrationStart),
      registrationEnd: toLocalDT(c.registrationEnd),
      eventDate: c.eventDate ? c.eventDate.slice(0, 10) : '',
      isActive: c.isActive,
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.registrationStart || !form.registrationEnd) return
    setSaving(true)
    if (editId) {
      await fetch(`/api/competitions/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setShowModal(false)
    fetchAll()
  }

  const handleToggle = async (c: Competition) => {
    await fetch(`/api/competitions/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !c.isActive }),
    })
    fetchAll()
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Yarışmalar</h1>
          <p className="text-gray-500 text-sm mt-1">Yarışma etkinliklerini yönetin</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Yeni Yarışma
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
      ) : competitions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🏆</div>
          <p>Henüz yarışma oluşturulmamış.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {competitions.map(c => (
            <div key={c.id} className={`bg-white rounded-xl shadow-sm border-2 p-5 ${c.isActive ? 'border-green-200' : 'border-gray-100'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-800">{c.name}</h3>
                    {c.isActive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Aktif</span>}
                  </div>
                  {c.location && <p className="text-sm text-gray-500">{c.location}</p>}
                  <div className="text-xs text-gray-400 mt-1.5 space-y-0.5">
                    <p>Kayıt: {fmt(c.registrationStart)} — {fmt(c.registrationEnd)}</p>
                    {c.eventDate && <p>Etkinlik: {fmt(c.eventDate)}</p>}
                    <p className="font-medium text-gray-500">{c._count.animals} hayvan kayıtlı</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => handleToggle(c)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${c.isActive ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                  >
                    {c.isActive ? 'Pasife Al' : 'Aktif Et'}
                  </button>
                  <Link
                    href={`/admin/yarismalar/${c.id}`}
                    className="text-xs font-medium bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    Yönet →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Oluştur / Düzenle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-bold text-gray-800 text-lg">
                {editId ? 'Yarışmayı Düzenle' : 'Yeni Yarışma Oluştur'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Yarışma Adı *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="örn. 2026 Türkiye Süs Tavukları Yarışması"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Konum</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="örn. Ankara Atatürk Spor Salonu"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kayıt Başlangıcı *</label>
                  <input type="datetime-local" value={form.registrationStart}
                    onChange={e => setForm({ ...form, registrationStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kayıt Bitişi *</label>
                  <input type="datetime-local" value={form.registrationEnd}
                    onChange={e => setForm({ ...form, registrationEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Etkinlik Tarihi</label>
                <input type="date" value={form.eventDate}
                  onChange={e => setForm({ ...form, eventDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="isActiveModal" checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600" />
                <label htmlFor="isActiveModal" className="text-sm text-gray-700">Aktif (kayıt dönemi açık)</label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={handleSubmit}
                disabled={saving || !form.name || !form.registrationStart || !form.registrationEnd}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : editId ? '💾 Değişiklikleri Kaydet' : '✓ Oluştur'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-5 text-gray-600 hover:text-gray-800 text-sm">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
