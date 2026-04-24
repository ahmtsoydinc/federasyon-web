'use client'

import { useEffect, useState, useRef } from 'react'

interface Document {
  id: number
  title: string
  fileUrl: string
  category: string | null
  createdAt: string
}

export default function BelgelerPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', fileUrl: '', category: '' })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetch_ = () => {
    setLoading(true)
    fetch('/api/documents')
      .then((r) => r.json())
      .then(setDocs)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch_() }, [])

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setUploadError(`Dosya yükleme hatası: ${data.error || `HTTP ${res.status}`}`)
      } else {
        setForm((prev) => ({ ...prev, fileUrl: data.url, title: prev.title || file.name.replace(/\.[^.]+$/, '') }))
      }
    } catch (err) {
      setUploadError(`Bağlantı hatası: ${err}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.fileUrl) return
    setSaving(true)
    await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setForm({ title: '', fileUrl: '', category: '' })
    setShowForm(false)
    fetch_()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Belgeyi silmek istiyor musunuz?')) return
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    fetch_()
  }

  const grouped = docs.reduce<Record<string, Document[]>>((acc, doc) => {
    const cat = doc.category || 'Diğer'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(doc)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Belgeler</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          + Belge Yükle
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Yeni Belge</h2>
          <div className="space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Belge adı"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Kategori (ör: Tüzük, Yönetmelik, Formlar)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />

            <input type="file" ref={fileRef} className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />

            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
            >
              {uploading ? (
                <div className="text-primary-600">Yükleniyor...</div>
              ) : form.fileUrl ? (
                <div className="text-green-600 text-sm">✓ {form.fileUrl.split('/').pop()}</div>
              ) : (
                <div className="text-gray-400 text-sm">PDF veya dosya seçmek için tıklayın</div>
              )}
            </div>
            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">⚠️ {uploadError}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">Yükleniyor...</div>
      ) : docs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">Belge bulunmuyor.</div>
      ) : (
        Object.entries(grouped).map(([cat, catDocs]) => (
          <div key={cat} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{cat}</h2>
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
              {catDocs.map((doc) => (
                <div key={doc.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{doc.title}</div>
                      <div className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                    >
                      İndir
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
