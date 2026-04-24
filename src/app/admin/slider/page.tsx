'use client'

import { useEffect, useState, useRef } from 'react'

interface Slide {
  id: number
  title: string
  subtitle: string | null
  imageUrl: string
  videoUrl: string | null
  linkUrl: string | null
  linkLabel: string | null
  active: boolean
  order: number
}

const emptyForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  videoUrl: '',
  linkUrl: '',
  linkLabel: '',
  active: true,
  order: 0,
}

export default function SliderPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null)

  // Toplu yükleme state'i
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const bulkInputRef = useRef<HTMLInputElement>(null)

  // Geçiş süresi ayarı
  const [interval, setIntervalVal] = useState(5)
  const [savingInterval, setSavingInterval] = useState(false)
  const [intervalSaved, setIntervalSaved] = useState(false)

  const fetch_ = () => {
    setLoading(true)
    fetch('/api/sliders?all=1')
      .then(r => r.json())
      .then(data => setSlides(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  // Mevcut interval ayarını yükle
  useEffect(() => {
    fetch_()
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(data => {
        if (data.slider_interval) setIntervalVal(Number(data.slider_interval))
      })
  }, [])

  // Geçiş süresini kaydet
  const handleSaveInterval = async () => {
    setSavingInterval(true)
    await fetch('/api/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slider_interval: String(interval) }),
    })
    setSavingInterval(false)
    setIntervalSaved(true)
    setTimeout(() => setIntervalSaved(false), 2500)
  }

  // Tek resim yükleme (form içinde) — slider profiliyle boyutlandır
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'slider')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setUploadError(`Yükleme hatası: ${data.error || `HTTP ${res.status}`}`)
      } else {
        setForm(f => ({ ...f, imageUrl: data.url }))
      }
    } catch (err) {
      setUploadError(`Bağlantı hatası: ${err}`)
    } finally {
      setUploading(false)
    }
  }

  // Video yükleme
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoUploading(true)
    setVideoUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setVideoUploadError(`Yükleme hatası: ${data.error || `HTTP ${res.status}`}`)
      } else {
        setForm(f => ({ ...f, videoUrl: data.url }))
      }
    } catch (err) {
      setVideoUploadError(`Bağlantı hatası: ${err}`)
    } finally {
      setVideoUploading(false)
    }
  }

  // Toplu resim yükleme — her resim = ayrı slide
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setBulkUploading(true)
    setBulkError(null)
    setBulkProgress({ done: 0, total: files.length })

    // Mevcut en büyük sırayı bul
    const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) : -1

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Resmi yükle — slider profiliyle otomatik boyutlandır
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', 'slider')
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await upRes.json()

        if (!upRes.ok || !upData.url) {
          setBulkError(`"${file.name}" yüklenemedi: ${upData.error || `HTTP ${upRes.status}`}`)
          break
        }

        // Slide oluştur — başlık dosya adından türet
        const rawName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
        const title = rawName.charAt(0).toUpperCase() + rawName.slice(1)

        await fetch('/api/sliders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            imageUrl: upData.url,
            active: true,
            order: maxOrder + 1 + i,
          }),
        })
      } catch (err) {
        setBulkError(`Bağlantı hatası: ${err}`)
        break
      }
      setBulkProgress({ done: i + 1, total: files.length })
    }

    setBulkUploading(false)
    setBulkProgress(null)
    if (bulkInputRef.current) bulkInputRef.current.value = ''
    fetch_()
  }

  // Tekli kaydet / güncelle
  const handleSave = async () => {
    if (!form.title) return
    if (!form.imageUrl && !form.videoUrl) return
    setSaving(true)
    if (editId) {
      await fetch(`/api/sliders/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    fetch_()
  }

  const handleEdit = (s: Slide) => {
    setForm({
      title: s.title,
      subtitle: s.subtitle || '',
      imageUrl: s.imageUrl || '',
      videoUrl: s.videoUrl || '',
      linkUrl: s.linkUrl || '',
      linkLabel: s.linkLabel || '',
      active: s.active,
      order: s.order,
    })
    setEditId(s.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu slide\'ı silmek istiyor musunuz?')) return
    await fetch(`/api/sliders/${id}`, { method: 'DELETE' })
    fetch_()
  }

  const handleToggleActive = async (s: Slide) => {
    await fetch(`/api/sliders/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...s,
        subtitle: s.subtitle ?? null,
        videoUrl: s.videoUrl ?? null,
        linkUrl: s.linkUrl ?? null,
        linkLabel: s.linkLabel ?? null,
        active: !s.active,
      }),
    })
    fetch_()
  }

  const canSave = !!form.title && (!!form.imageUrl || !!form.videoUrl)

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Slider Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Ana sayfadaki büyük slayt bölümü</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm) }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          + Slide Ekle
        </button>
      </div>

      {/* Geçiş Süresi Ayarı */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>⏱</span> Otomatik Geçiş Süresi
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          {/* Hızlı seçim butonları */}
          <div className="flex gap-2 flex-wrap">
            {[3, 5, 7, 10, 15].map(s => (
              <button
                key={s}
                onClick={() => setIntervalVal(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  interval === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600'
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
          {/* Manuel giriş */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={60}
              value={interval}
              onChange={e => setIntervalVal(Number(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-center"
            />
            <span className="text-sm text-gray-500">saniye</span>
          </div>
          <button
            onClick={handleSaveInterval}
            disabled={savingInterval}
            className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {savingInterval ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {intervalSaved && <span className="text-green-600 text-sm font-medium">✓ Kaydedildi</span>}
        </div>
      </div>

      {/* Toplu resim yükleme */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <span>📤</span> Toplu Resim Yükleme
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Birden fazla resim seçin — her resim otomatik olarak ayrı bir slide oluşturur.
          Başlık ve bağlantıyı daha sonra düzenleyebilirsiniz.
        </p>

        {bulkError && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            ⚠️ {bulkError}
          </div>
        )}
        {bulkUploading && bulkProgress ? (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-primary-700 font-medium">Yükleniyor... {bulkProgress.done}/{bulkProgress.total}</span>
              <span className="text-gray-500">{Math.round((bulkProgress.done / bulkProgress.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300 rounded-full"
                style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <label className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-dashed border-primary-300 hover:border-primary-500 text-primary-700 font-medium px-6 py-3 rounded-xl transition-colors text-sm hover:bg-primary-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Birden Fazla Resim Seç
            <input
              ref={bulkInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleBulkUpload}
              disabled={bulkUploading}
            />
          </label>
        )}
      </div>

      {/* Tekli ekleme / düzenleme formu */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-5">{editId ? 'Slide Düzenle' : 'Yeni Slide'}</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Başlık *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Slayt başlığı"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Alt Başlık <span className="text-gray-400 font-normal">(opsiyonel)</span></label>
              <textarea
                value={form.subtitle}
                onChange={e => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Kısa açıklama"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
              />
            </div>

            {/* Video — varsa resim yerine oynatılır */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Video <span className="text-gray-400 font-normal">(opsiyonel — MP4, varsa resim yerine oynatılır)</span>
              </label>
              <div className="flex items-start gap-4 flex-wrap">
                {form.videoUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-black" style={{ width: 192, height: 112 }}>
                    <video src={form.videoUrl} className="w-full h-full object-contain" muted />
                    <button
                      onClick={() => setForm({ ...form, videoUrl: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >✕</button>
                    <div className="absolute bottom-1 left-2 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">🎬 Video</div>
                  </div>
                )}
                {!form.videoUrl && (
                  <div className="flex flex-col gap-2">
                    <label className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors text-center ${videoUploading ? 'opacity-60 cursor-not-allowed' : 'hover:border-purple-400 hover:bg-purple-50'} border-gray-300`} style={{ width: 192, height: 112 }}>
                      <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                      </svg>
                      <span className="text-xs text-gray-500">{videoUploading ? 'Yükleniyor...' : 'Video Seç (MP4)'}</span>
                      <input type="file" accept="video/mp4,video/*" className="hidden" onChange={handleVideoUpload} disabled={videoUploading} />
                    </label>
                    {videoUploadError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-2 py-1.5 rounded-lg" style={{ width: 192 }}>
                        ⚠️ {videoUploadError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Resim */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Arka Plan Resmi {form.videoUrl ? <span className="text-gray-400 font-normal">(video varsa gösterilmez)</span> : <span className="text-red-500">*</span>}
              </label>
              <div className="flex items-start gap-4 flex-wrap">
                {form.imageUrl && (
                  <div className="relative w-48 h-28 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={form.imageUrl} alt="önizleme" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >✕</button>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-48 h-28 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-center">
                    <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-500">{uploading ? 'Yükleniyor...' : 'Resim Seç'}</span>
                    <span className="text-xs text-gray-400">önerilen: 1920×640</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  {uploadError && (
                    <div className="w-48 bg-red-50 border border-red-200 text-red-600 text-xs px-2 py-1.5 rounded-lg">
                      ⚠️ {uploadError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bağlantı URL</label>
              <input
                value={form.linkUrl}
                onChange={e => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="/haberler/haber-adi veya https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Buton Metni</label>
              <input
                value={form.linkLabel}
                onChange={e => setForm({ ...form, linkLabel: e.target.value })}
                placeholder="Devamını Oku, İncele..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
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

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer mb-1">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary-600"
                />
                <span className="text-sm text-gray-700">Aktif (ana sayfada göster)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Kaydet'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}
              className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Slide listesi */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400">Yükleniyor...</div>
      ) : slides.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center">
          <div className="text-5xl mb-3">🖼</div>
          <div className="text-gray-500 mb-2">Henüz slide eklenmemiş.</div>
          <div className="text-sm text-gray-400">Yukarıdan resim yükleyin veya "Slide Ekle" butonunu kullanın.</div>
        </div>
      ) : (
        <div className="grid gap-3">
          {slides.map((s, i) => (
            <div key={s.id} className={`bg-white rounded-xl shadow-sm overflow-hidden flex ${!s.active ? 'opacity-55' : ''}`}>
              {/* Thumbnail */}
              <div className="relative w-40 md:w-56 flex-shrink-0 bg-black">
                {s.videoUrl ? (
                  <video src={s.videoUrl} className="w-full h-full object-contain" style={{ minHeight: '110px' }} muted />
                ) : (
                  <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" style={{ minHeight: '110px' }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <span className="bg-black/50 text-white text-xs font-bold px-2 py-0.5 rounded">#{i + 1}</span>
                  {s.videoUrl && <span className="bg-purple-600/80 text-white text-xs px-2 py-0.5 rounded">🎬 Video</span>}
                </div>
              </div>

              {/* Bilgi */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-800 leading-snug">{s.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  {s.subtitle && <p className="text-xs text-gray-500 line-clamp-1">{s.subtitle}</p>}
                  {s.linkUrl && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-primary-600 truncate">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="truncate">{s.linkUrl}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <button onClick={() => handleEdit(s)} className="text-primary-600 hover:text-primary-800 text-xs font-medium">Düzenle</button>
                  <button onClick={() => handleToggleActive(s)} className={`text-xs font-medium ${s.active ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}>
                    {s.active ? 'Pasifleştir' : 'Aktifleştir'}
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Sil</button>
                  <span className="text-xs text-gray-400 ml-auto">Sıra: {s.order}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
