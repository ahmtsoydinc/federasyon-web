'use client'

import { useEffect, useState } from 'react'

interface Page { id: number; title: string; slug: string; content: string; pdfUrl: string | null; updatedAt: string }

export default function SayfalarPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Page | null>(null)
  const [form, setForm] = useState({ title: '', content: '', pdfUrl: '' })
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const fetchPages = () => {
    setLoading(true)
    fetch('/api/pages').then(r => r.json()).then(setPages).finally(() => setLoading(false))
  }

  useEffect(() => { fetchPages() }, [])

  const startEdit = (p: Page) => {
    setEditing(p)
    setForm({ title: p.title, content: p.content, pdfUrl: p.pdfUrl || '' })
    setShowNew(false)
    setMsg('')
    setUploadError('')
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setUploadError(data.error || 'Yükleme başarısız')
      } else {
        setForm(f => ({ ...f, pdfUrl: data.url }))
      }
    } catch {
      setUploadError('Bağlantı hatası')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return
    setSaving(true)
    const res = editing
      ? await fetch(`/api/pages/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      : await fetch('/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (res.ok) {
      setMsg('✓ Sayfa kaydedildi.')
      setEditing(null)
      setShowNew(false)
      setForm({ title: '', content: '', pdfUrl: '' })
      fetchPages()
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" sayfasını silmek istiyor musunuz?`)) return
    await fetch(`/api/pages/${id}`, { method: 'DELETE' })
    if (editing?.id === id) { setEditing(null); setForm({ title: '', content: '', pdfUrl: '' }) }
    fetchPages()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sayfalar</h1>
        <button
          onClick={() => { setShowNew(true); setEditing(null); setForm({ title: '', content: '', pdfUrl: '' }); setMsg(''); setUploadError('') }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          + Yeni Sayfa
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sayfa listesi */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-400">Yükleniyor...</div>
            ) : pages.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">Sayfa bulunmuyor.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pages.map(p => (
                  <div
                    key={p.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${editing?.id === p.id ? 'bg-primary-50' : ''}`}
                    onClick={() => startEdit(p)}
                  >
                    <div className="font-medium text-gray-800 text-sm">{p.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">/{p.slug}</span>
                      {p.pdfUrl && <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded">PDF</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editör */}
        <div className="lg:col-span-2">
          {(editing || showNew) ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-700 mb-4">
                {editing ? `Düzenle: ${editing.title}` : 'Yeni Sayfa'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sayfa Başlığı *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Sayfa başlığı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İçerik *</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    rows={14}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono resize-y"
                    placeholder="Sayfa içeriğini buraya girin (HTML desteklenir)..."
                  />
                  <p className="text-xs text-gray-400 mt-1">HTML etiketleri kullanabilirsiniz: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, vb.</p>
                </div>

                {/* PDF Yükleme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PDF Eki (opsiyonel)</label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {form.pdfUrl ? (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3v-1h5v1H8z"/>
                        </svg>
                        <span className="text-sm text-red-700 font-medium truncate max-w-[200px]">
                          {form.pdfUrl.split('/').pop()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, pdfUrl: '' })}
                          className="text-red-400 hover:text-red-600 text-xs ml-1"
                        >✕</button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {uploading ? 'Yükleniyor...' : '📄 PDF Yükle'}
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handlePdfUpload}
                          disabled={uploading}
                        />
                      </label>
                    )}
                    {form.pdfUrl && (
                      <a href={form.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline">
                        Önizle ↗
                      </a>
                    )}
                  </div>
                  {uploadError && (
                    <p className="text-xs text-red-500 mt-1">⚠️ {uploadError}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Yüklenen PDF sayfada indirme linki olarak görünecektir.</p>
                </div>

                {msg && <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">{msg}</div>}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
                  >
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  {editing && (
                    <button
                      onClick={() => handleDelete(editing.id, editing.title)}
                      className="border border-red-200 text-red-600 px-5 py-2 rounded-lg text-sm hover:bg-red-50"
                    >
                      Sil
                    </button>
                  )}
                  <button
                    onClick={() => { setEditing(null); setShowNew(false); setForm({ title: '', content: '', pdfUrl: '' }) }}
                    className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm">Düzenlemek için bir sayfa seçin veya yeni sayfa oluşturun.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
