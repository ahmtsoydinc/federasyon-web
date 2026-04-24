'use client'

import { useEffect, useState } from 'react'

interface Sponsor {
  id: number
  name: string
  logoUrl: string | null
  websiteUrl: string | null
  isMain: boolean
  active: boolean
  order: number
}

const emptyForm = { name: '', logoUrl: '', websiteUrl: '', isMain: false, order: 0 }

export default function SponsorlarPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetch_ = () => {
    setLoading(true)
    fetch('/api/sponsors?all=1')
      .then(r => r.json())
      .then(setSponsors)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch_() }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'logo') // 500×300 inside (oran korunur)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setUploadError(`Logo yükleme hatası: ${data.error || `HTTP ${res.status}`}`)
      } else {
        setForm(f => ({ ...f, logoUrl: data.url }))
      }
    } catch (err) {
      setUploadError(`Bağlantı hatası: ${err}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setSaveError('Sponsor adı zorunludur.')
      return
    }
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(null)
    try {
      const url = editId ? `/api/sponsors/${editId}` : '/api/sponsors'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(`Kayıt hatası: ${data.error || `HTTP ${res.status}`}`)
        setSaving(false)
        return
      }
      setSaveSuccess(editId ? '✓ Sponsor güncellendi.' : '✓ Sponsor eklendi! Yeni sponsor ekleyebilirsiniz.')
      setForm({ name: '', logoUrl: '', websiteUrl: '', isMain: false, order: 0 })
      setEditId(null)
      // Formu açık bırak — hemen bir tane daha ekleyebilsin
      fetch_()
    } catch (err) {
      setSaveError(`Bağlantı hatası: ${err}`)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (s: Sponsor) => {
    setForm({ name: s.name, logoUrl: s.logoUrl || '', websiteUrl: s.websiteUrl || '', isMain: s.isMain, order: s.order })
    setEditId(s.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu sponsoru silmek istiyor musunuz?')) return
    await fetch(`/api/sponsors/${id}`, { method: 'DELETE' })
    fetch_()
  }

  const handleToggleActive = async (s: Sponsor) => {
    await fetch(`/api/sponsors/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...s, active: !s.active }),
    })
    fetch_()
  }

  return (
    <div>
      {saveError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>⚠️ {saveError}</span>
          <button onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-600 ml-3">✕</button>
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>✓ {saveSuccess}</span>
          <button onClick={() => setSaveSuccess(null)} className="text-green-400 hover:text-green-600 ml-3">✕</button>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sponsorlar</h1>
          <p className="text-sm text-gray-500 mt-1">İstediğiniz kadar sponsor ekleyebilirsiniz</p>
        </div>
        <button
          onClick={() => { setForm({ name: '', logoUrl: '', websiteUrl: '', isMain: false, order: 0 }); setEditId(null); setSaveError(null); setSaveSuccess(null); setShowForm(true) }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          + Sponsor Ekle
        </button>
      </div>

      {/* Bilgi kutusu */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <div className="flex items-start gap-3">
          <div>
            <div><strong>⭐ Ana Sponsor</strong> — Sayfada altın renkli büyük banner olarak gösterilir. <span className="text-blue-500">(1 tane)</span></div>
            <div className="mt-1"><strong>🏷 Sponsor</strong> — Koyu şerit üzerinde logo kartları olarak gösterilir. <span className="text-blue-500">(Sınırsız eklenebilir)</span></div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">{editId ? 'Sponsor Düzenle' : 'Yeni Sponsor'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sponsor Adı *</label>
              <input
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setSaveError(null) }}
                placeholder="Örn: TRT, Tarım Bakanlığı..."
                className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm ${!form.name.trim() && saveError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Web Sitesi (opsiyonel)</label>
              <input
                value={form.websiteUrl}
                onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder="https://www.sponsor.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Logo</label>
              <div className="flex items-center gap-3 flex-wrap">
                {form.logoUrl && (
                  <img src={form.logoUrl} alt="logo" className="h-12 w-auto object-contain border border-gray-200 rounded p-1" />
                )}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg transition-colors">
                  {uploading ? 'Yükleniyor...' : 'Logo Seç'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                {form.logoUrl && (
                  <button onClick={() => setForm({ ...form, logoUrl: '' })} className="text-red-400 text-xs hover:text-red-600">Kaldır</button>
                )}
              </div>
              {uploadError && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">⚠️ {uploadError}</div>
              )}
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
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isMain}
                onChange={e => setForm({ ...form, isMain: e.target.checked })}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <span className="text-sm font-medium text-gray-700">
                ⭐ Ana Sponsor olarak işaretle
                <span className="text-xs text-gray-400 ml-1">(altın banner — sadece 1 tane olur, işaretlemezseniz logo şeridinde görünür)</span>
              </span>
            </label>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Kaydet'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}
              className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
        ) : sponsors.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Henüz sponsor eklenmemiş.</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Logo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sponsor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Tip</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Sıra</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sponsors.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt={s.name} className="h-10 w-20 object-contain" />
                    ) : (
                      <div className="h-10 w-20 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">Logo yok</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{s.name}</div>
                    {s.websiteUrl && <div className="text-xs text-primary-600 truncate max-w-[180px]">{s.websiteUrl}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      {s.isMain ? (
                        <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-semibold w-fit">Ana Sponsor</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full w-fit">Sponsor</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {s.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{s.order}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => handleEdit(s)} className="text-primary-600 hover:text-primary-800 text-xs font-medium">Düzenle</button>
                    <button onClick={() => handleToggleActive(s)} className={`text-xs font-medium ${s.active ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}>
                      {s.active ? 'Pasifleştir' : 'Aktifleştir'}
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
