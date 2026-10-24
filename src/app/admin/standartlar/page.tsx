'use client'

import { useEffect, useState, useRef } from 'react'

interface StandardImage {
  id: number
  url: string
  caption?: string
  order: number
}

interface Standard {
  id: number
  categoryId: number
  name: string
  subtitle?: string
  breedPdfUrl?: string
  colourPdfUrl?: string
  breedDate?: string
  colourDate?: string
  isDraft: boolean
  order: number
  images: StandardImage[]
  category: { label: string; color: string }
}

interface Category {
  id: number
  slug: string
  label: string
  fullTitle: string
  color: string
  order: number
  _count?: { standards: number }
}

type Tab = 'categories' | 'standards'

const EMPTY_CAT = { slug: '', label: '', fullTitle: '', color: '#059669', order: 0 }
const EMPTY_STD = { categoryId: '', name: '', subtitle: '', breedPdfUrl: '', colourPdfUrl: '', breedDate: '', colourDate: '', isDraft: false, order: 0 }

export default function AdminStandartlarPage() {
  const [tab, setTab] = useState<Tab>('standards')
  const [categories, setCategories] = useState<Category[]>([])
  const [standards, setStandards] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  // Category form
  const [catForm, setCatForm] = useState(EMPTY_CAT)
  const [editCatId, setEditCatId] = useState<number | null>(null)
  const [catModal, setCatModal] = useState(false)

  // Standard form
  const [stdForm, setStdForm] = useState(EMPTY_STD)
  const [editStdId, setEditStdId] = useState<number | null>(null)
  const [stdModal, setStdModal] = useState(false)

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageStdId, setImageStdId] = useState<number | null>(null)
  const [imageCaption, setImageCaption] = useState('')
  const [imageModal, setImageModal] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // PDF upload states
  const [uploadingBreedPdf, setUploadingBreedPdf] = useState(false)
  const [uploadingColourPdf, setUploadingColourPdf] = useState(false)
  const breedPdfRef = useRef<HTMLInputElement>(null)
  const colourPdfRef = useRef<HTMLInputElement>(null)

  // Filter
  const [filterCat, setFilterCat] = useState<number | ''>('')
  const [searchQ, setSearchQ] = useState('')

  // Move popover
  const [movePopover, setMovePopover] = useState<number | null>(null) // stdId

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const fetchAll = async () => {
    const [catRes, stdRes] = await Promise.all([
      fetch('/api/admin/standartlar/categories'),
      fetch('/api/admin/standartlar'),
    ])
    setCategories(await catRes.json())
    setStandards(await stdRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    if (movePopover === null) return
    const close = () => setMovePopover(null)
    window.addEventListener('click', close, { capture: true, once: true })
    return () => window.removeEventListener('click', close, { capture: true })
  }, [movePopover])

  // ── Categories CRUD ──────────────────────────────────────────────────────────

  const openNewCat = () => { setCatForm(EMPTY_CAT); setEditCatId(null); setCatModal(true) }
  const openEditCat = (c: Category) => {
    setCatForm({ slug: c.slug, label: c.label, fullTitle: c.fullTitle, color: c.color, order: c.order })
    setEditCatId(c.id)
    setCatModal(true)
  }

  const saveCat = async () => {
    const method = editCatId ? 'PUT' : 'POST'
    const url = editCatId ? `/api/admin/standartlar/categories/${editCatId}` : '/api/admin/standartlar/categories'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) })
    if (res.ok) { flash(editCatId ? 'Kategori güncellendi' : 'Kategori eklendi'); setCatModal(false); fetchAll() }
    else flash('Hata oluştu')
  }

  const deleteCat = async (id: number) => {
    if (!confirm('Bu kategoriyi ve tüm standartlarını silmek istediğinizden emin misiniz?')) return
    const res = await fetch(`/api/admin/standartlar/categories/${id}`, { method: 'DELETE' })
    if (res.ok) { flash('Kategori silindi'); fetchAll() }
  }

  // ── Standards CRUD ───────────────────────────────────────────────────────────

  const openNewStd = () => { setStdForm(EMPTY_STD); setEditStdId(null); setStdModal(true) }
  const openEditStd = (s: Standard) => {
    setStdForm({
      categoryId: String(s.categoryId),
      name: s.name,
      subtitle: s.subtitle || '',
      breedPdfUrl: s.breedPdfUrl || '',
      colourPdfUrl: s.colourPdfUrl || '',
      breedDate: s.breedDate || '',
      colourDate: s.colourDate || '',
      isDraft: s.isDraft,
      order: s.order,
    })
    setEditStdId(s.id)
    setStdModal(true)
  }

  const saveStd = async () => {
    const method = editStdId ? 'PUT' : 'POST'
    const url = editStdId ? `/api/admin/standartlar/${editStdId}` : '/api/admin/standartlar'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stdForm) })
    if (res.ok) { flash(editStdId ? 'Standart güncellendi' : 'Standart eklendi'); setStdModal(false); fetchAll() }
    else flash('Hata oluştu')
  }

  const deleteStd = async (id: number) => {
    if (!confirm('Bu standardı silmek istediğinizden emin misiniz?')) return
    const res = await fetch(`/api/admin/standartlar/${id}`, { method: 'DELETE' })
    if (res.ok) { flash('Standart silindi'); fetchAll() }
  }

  // ── PDF Upload ───────────────────────────────────────────────────────────────

  const uploadPdf = async (file: File, field: 'breedPdfUrl' | 'colourPdfUrl') => {
    const setter = field === 'breedPdfUrl' ? setUploadingBreedPdf : setUploadingColourPdf
    setter(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    setter(false)
    if (res.ok) {
      const { url } = await res.json()
      setStdForm((f) => ({ ...f, [field]: url }))
    } else {
      flash('PDF yükleme hatası')
    }
  }

  // ── Image Upload ─────────────────────────────────────────────────────────────

  const openImageModal = (stdId: number) => {
    setImageStdId(stdId)
    setImageCaption('')
    setImageModal(true)
  }

  const uploadImage = async (files: FileList | null) => {
    if (!files || !imageStdId) return
    for (const file of Array.from(files)) {
      setUploadingImage(true)
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'thumbnail')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        await fetch(`/api/admin/standartlar/${imageStdId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, caption: imageCaption }),
        })
      }
    }
    setUploadingImage(false)
    flash('Resim(ler) yüklendi')
    setImageModal(false)
    fetchAll()
  }

  const deleteImage = async (stdId: number, imgId: number) => {
    if (!confirm('Bu resmi silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/admin/standartlar/${stdId}/images/${imgId}`, { method: 'DELETE' })
    fetchAll()
  }

  // ── Filtered standards ───────────────────────────────────────────────────────

  // ── Move standard to another category ──────────────────────────────────────

  const moveStd = async (stdId: number, newCategoryId: number) => {
    const res = await fetch(`/api/admin/standartlar/${stdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: newCategoryId }),
    })
    if (res.ok) {
      flash('Standart taşındı')
      setMovePopover(null)
      fetchAll()
    } else {
      flash('Hata oluştu')
    }
  }

  const filteredStds = standards.filter((s) => {
    const matchCat = filterCat === '' || s.categoryId === filterCat
    const matchQ = !searchQ || s.name.toLowerCase().includes(searchQ.toLowerCase())
    return matchCat && matchQ
  })

  if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor…</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Irk Standartları</h1>
        {msg && (
          <div className="bg-emerald-100 text-emerald-800 text-sm px-4 py-2 rounded-lg">{msg}</div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(['standards', 'categories'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'standards' ? 'Standartlar' : 'Kategoriler'}
          </button>
        ))}
      </div>

      {/* ─── CATEGORIES TAB ─────────────────────────────────────────────── */}
      {tab === 'categories' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={openNewCat} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1">
              <span>+</span> Yeni Kategori
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Renk</th>
                  <th className="text-left px-4 py-3">Slug</th>
                  <th className="text-left px-4 py-3">Etiket</th>
                  <th className="text-left px-4 py-3">Tam Başlık</th>
                  <th className="text-center px-4 py-3">Sıra</th>
                  <th className="text-center px-4 py-3">Standart</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: c.color }} />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{c.slug}</td>
                    <td className="px-4 py-2.5 font-medium">{c.label}</td>
                    <td className="px-4 py-2.5 text-gray-600">{c.fullTitle}</td>
                    <td className="px-4 py-2.5 text-center text-gray-400">{c.order}</td>
                    <td className="px-4 py-2.5 text-center text-gray-400">{c._count?.standards ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEditCat(c)} className="text-xs text-blue-600 hover:underline">Düzenle</button>
                        <button onClick={() => deleteCat(c.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── STANDARDS TAB ──────────────────────────────────────────────── */}
      {tab === 'standards' && (
        <div>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <input
              type="text"
              placeholder="Irk ara…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <div className="ml-auto">
              <button onClick={openNewStd} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1">
                <span>+</span> Yeni Standart
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Irk Adı</th>
                  <th className="text-left px-4 py-3">Kategori</th>
                  <th className="text-center px-3 py-3">Irk PDF</th>
                  <th className="text-center px-3 py-3">Renk PDF</th>
                  <th className="text-center px-3 py-3">Resimler</th>
                  <th className="text-center px-3 py-3">Taslak</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredStds.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Sonuç yok</td></tr>
                ) : filteredStds.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-gray-800">{s.name}</div>
                      {s.subtitle && <div className="text-xs text-gray-400">{s.subtitle}</div>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMovePopover(movePopover === s.id ? null : s.id)}
                          title="Kategoriyi değiştirmek için tıkla"
                          className="text-[11px] px-2 py-0.5 rounded-full text-white font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
                          style={{ backgroundColor: s.category.color }}
                        >
                          {s.category.label}
                          <svg className="w-2.5 h-2.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                        {movePopover === s.id && (
                          <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                            <div className="px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wide font-semibold border-b border-gray-100 mb-1">
                              Taşı →
                            </div>
                            {categories
                              .filter((c) => c.id !== s.categoryId)
                              .map((c) => (
                                <button
                                  key={c.id}
                                  onClick={() => moveStd(s.id, c.id)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                  {c.label}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {s.breedPdfUrl
                        ? <a href={s.breedPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">PDF ✓</a>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {s.colourPdfUrl
                        ? <a href={s.colourPdfUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-xs hover:underline">PDF ✓</a>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => openImageModal(s.id)}
                        className="text-xs text-purple-600 hover:underline"
                        title="Resimleri yönet"
                      >
                        {s.images.length > 0 ? `${s.images.length} resim` : 'Ekle'}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs font-medium ${s.isDraft ? 'text-yellow-600' : 'text-gray-300'}`}>
                        {s.isDraft ? 'Evet' : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEditStd(s)} className="text-xs text-blue-600 hover:underline">Düzenle</button>
                        <button onClick={() => deleteStd(s.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── CATEGORY MODAL ─────────────────────────────────────────────── */}
      {catModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setCatModal(false) }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editCatId ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Slug *</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="dev-irk-tavuk" value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sıra</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={catForm.order} onChange={(e) => setCatForm({ ...catForm, order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Kısa Etiket * (tab'da görünür)</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Dev Irk Tavuk" value={catForm.label} onChange={(e) => setCatForm({ ...catForm, label: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tam Başlık *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Dev Irk Tavuk Standartları" value={catForm.fullTitle} onChange={(e) => setCatForm({ ...catForm, fullTitle: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Renk</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="w-10 h-9 rounded border cursor-pointer" />
                  <input className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setCatModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
              <button onClick={saveCat} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STANDARD MODAL ─────────────────────────────────────────────── */}
      {stdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setStdModal(false) }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editStdId ? 'Standart Düzenle' : 'Yeni Standart'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kategori *</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={stdForm.categoryId} onChange={(e) => setStdForm({ ...stdForm, categoryId: e.target.value })}>
                    <option value="">Seçin…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sıra</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={stdForm.order} onChange={(e) => setStdForm({ ...stdForm, order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Irk Adı *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Alman Langshan" value={stdForm.name} onChange={(e) => setStdForm({ ...stdForm, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Alt Etiket</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Yerli ırk, Taslak…" value={stdForm.subtitle} onChange={(e) => setStdForm({ ...stdForm, subtitle: e.target.value })} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" checked={stdForm.isDraft} onChange={(e) => setStdForm({ ...stdForm, isDraft: e.target.checked })} />
                    <span className="text-sm text-gray-600">Taslak (henüz yayında değil)</span>
                  </label>
                </div>
              </div>

              {/* Breed PDF */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Irk Standardı PDF URL</label>
                <div className="flex gap-2">
                  <input className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono" placeholder="/standartlar/dosya.pdf veya https://…" value={stdForm.breedPdfUrl} onChange={(e) => setStdForm({ ...stdForm, breedPdfUrl: e.target.value })} />
                  <button
                    type="button"
                    onClick={() => breedPdfRef.current?.click()}
                    disabled={uploadingBreedPdf}
                    className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 whitespace-nowrap disabled:opacity-60"
                  >
                    {uploadingBreedPdf ? 'Yükleniyor…' : 'PDF Yükle'}
                  </button>
                  <input ref={breedPdfRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && uploadPdf(e.target.files[0], 'breedPdfUrl')} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Irk PDF Tarihi</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="23.11.2021" value={stdForm.breedDate} onChange={(e) => setStdForm({ ...stdForm, breedDate: e.target.value })} />
              </div>

              {/* Colour PDF */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Renk Standardı PDF URL</label>
                <div className="flex gap-2">
                  <input className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono" placeholder="/standartlar/dosya.pdf veya https://…" value={stdForm.colourPdfUrl} onChange={(e) => setStdForm({ ...stdForm, colourPdfUrl: e.target.value })} />
                  <button
                    type="button"
                    onClick={() => colourPdfRef.current?.click()}
                    disabled={uploadingColourPdf}
                    className="px-3 py-2 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 whitespace-nowrap disabled:opacity-60"
                  >
                    {uploadingColourPdf ? 'Yükleniyor…' : 'PDF Yükle'}
                  </button>
                  <input ref={colourPdfRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && uploadPdf(e.target.files[0], 'colourPdfUrl')} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Renk PDF Tarihi</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="23.11.2021" value={stdForm.colourDate} onChange={(e) => setStdForm({ ...stdForm, colourDate: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setStdModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
              <button onClick={saveStd} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── IMAGE MODAL ────────────────────────────────────────────────── */}
      {imageModal && imageStdId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setImageModal(false) }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
            <h2 className="text-lg font-bold mb-4">Resimler</h2>

            {/* Current images */}
            {(() => {
              const std = standards.find((s) => s.id === imageStdId)
              return std?.images.length ? (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {std.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img src={img.url} alt={img.caption || ''} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                      {img.caption && <p className="text-[10px] text-gray-500 mt-1 truncate">{img.caption}</p>}
                      <button
                        onClick={() => deleteImage(imageStdId, img.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm mb-4">Henüz resim eklenmemiş.</p>
              )
            })()}

            {/* Upload new */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Açıklama (opsiyonel)</label>
                <input className="w-full border rounded-lg px-3 py-1.5 text-sm" placeholder="Resim açıklaması…" value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} />
              </div>
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-60"
              >
                {uploadingImage ? 'Yükleniyor…' : '+ Resim Seç (birden fazla seçebilirsiniz)'}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => uploadImage(e.target.files)}
              />
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => setImageModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
