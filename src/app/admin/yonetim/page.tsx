'use client'

import { useEffect, useState } from 'react'

interface Member {
  id: number
  name: string
  title: string
  imageUrl: string | null
  board: string
  order: number
}

const BOARDS = [
  { key: 'yönetim', label: 'Yönetim Kurulu' },
  { key: 'denetim', label: 'Denetim Kurulu' },
  { key: 'disiplin', label: 'Disiplin Kurulu' },
]

const emptyForm = { name: '', title: '', board: 'yönetim', imageUrl: '', order: 0 }

export default function YonetimPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetch_ = () => {
    setLoading(true)
    fetch('/api/board').then(r => r.json()).then(setMembers).finally(() => setLoading(false))
  }

  useEffect(() => { fetch_() }, [])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'avatar')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setUploadError(`Fotoğraf yükleme hatası: ${data.error || `HTTP ${res.status}`}`)
      } else {
        setForm(f => ({ ...f, imageUrl: data.url }))
      }
    } catch (err) {
      setUploadError(`Bağlantı hatası: ${err}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.title.trim()) {
      setSaveError('Ad Soyad ve Görev zorunludur.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const url = editId ? `/api/board/${editId}` : '/api/board'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl: form.imageUrl || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        setSaveError(`Kayıt hatası: ${data.error || `HTTP ${res.status}`}`)
        return
      }
      setForm(emptyForm)
      setEditId(null)
      setShowForm(false)
      fetch_()
    } catch (err) {
      setSaveError(`Bağlantı hatası: ${err}`)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (m: Member) => {
    setForm({ name: m.name, title: m.title, board: m.board, imageUrl: m.imageUrl || '', order: m.order })
    setEditId(m.id)
    setShowForm(true)
    setSaveError(null)
    setUploadError(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu üyeyi silmek istiyor musunuz?')) return
    await fetch(`/api/board/${id}`, { method: 'DELETE' })
    fetch_()
  }

  const openNew = () => {
    setForm(emptyForm)
    setEditId(null)
    setSaveError(null)
    setUploadError(null)
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Yönetim Kadrosu</h1>
        <button onClick={openNew} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
          + Üye Ekle
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">{editId ? 'Üyeyi Düzenle' : 'Yeni Kurul Üyesi'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ahmet Yılmaz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Görev *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Başkan, Üye, Sekreter..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kurul</label>
              <select
                value={form.board}
                onChange={e => setForm({ ...form, board: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                {BOARDS.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sıra No</label>
              <input
                type="number"
                value={form.order}
                onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Fotoğraf yükleme */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">Fotoğraf</label>
            <div className="flex items-center gap-4 flex-wrap">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="Önizleme" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl border-2 border-dashed border-gray-300">👤</div>
              )}
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors">
                {uploading ? 'Yükleniyor...' : '📷 Fotoğraf Seç'}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
              {form.imageUrl && (
                <button onClick={() => setForm({ ...form, imageUrl: '' })} className="text-red-400 text-sm hover:text-red-600">Kaldır</button>
              )}
            </div>
            {uploadError && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">⚠️ {uploadError}</div>
            )}
          </div>

          {saveError && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">⚠️ {saveError}</div>
          )}

          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving || uploading} className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60">
              {saving ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Kaydet'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }} className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">Yükleniyor...</div>
      ) : (
        BOARDS.map(({ key, label }) => {
          const boardMembers = members.filter(m => m.board === key).sort((a, b) => a.order - b.order)
          return (
            <div key={key} className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{label}</h2>
              <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
                {boardMembers.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-gray-400">Henüz üye eklenmemiş.</div>
                ) : (
                  boardMembers.map(m => (
                    <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {m.imageUrl ? (
                          <img src={m.imageUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                            {m.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{m.name}</div>
                          <div className="text-xs text-gray-400">{m.title}</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(m)} className="text-primary-600 hover:text-primary-800 text-xs font-medium">Düzenle</button>
                        <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Sil</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
