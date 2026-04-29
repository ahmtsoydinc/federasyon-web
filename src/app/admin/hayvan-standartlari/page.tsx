'use client'

import { useState, useEffect, useCallback } from 'react'

const ANIMAL_TYPES = ['TAVUK', 'HOROZ', 'ORDEK', 'GUVERCIN', 'TAVSAN', 'KAZ', 'HINDI', 'BILDIRCIN']
const BREEDS = ['', 'DEV', 'CUCE']

interface Standard {
  id: number
  animalType: string
  breed: string | null
  species: string
  color: string
}

type Tab = 'ekle' | 'liste' | 'excel'

export default function HayvanStandartlariPage() {
  const [tab, setTab] = useState<Tab>('ekle')

  // --- Elle Ekle ---
  const [form, setForm] = useState({ animalType: 'TAVUK', breed: '', species: '', color: '' })
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ ok?: boolean; error?: string } | null>(null)

  const handleAdd = async () => {
    if (!form.species.trim() || !form.color.trim()) return
    setSaving(true)
    setSaveResult(null)
    try {
      const res = await fetch('/api/animal-standards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) setSaveResult({ error: data.error || 'Hata oluştu' })
      else {
        setSaveResult({ ok: true })
        setForm(f => ({ ...f, species: '', color: '' }))
      }
    } catch (e: any) {
      setSaveResult({ error: e?.message ?? 'Ağ hatası' })
    } finally {
      setSaving(false)
    }
  }

  // --- Liste ---
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [records, setRecords] = useState<Standard[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [listLoading, setListLoading] = useState(false)
  const PER_PAGE = 50

  const fetchList = useCallback(async () => {
    setListLoading(true)
    const params = new URLSearchParams({
      count: 'true',
      page: String(page),
      limit: String(PER_PAGE),
      ...(search ? { search } : {}),
      ...(filterType ? { animalType: filterType } : {}),
    })
    try {
      const res = await fetch(`/api/animal-standards?${params}`)
      const data = await res.json()
      setRecords(data.data)
      setTotal(data.total)
    } finally {
      setListLoading(false)
    }
  }, [search, filterType, page])

  useEffect(() => {
    if (tab === 'liste') fetchList()
  }, [tab, fetchList])

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/animal-standards?id=${id}`, { method: 'DELETE' })
    fetchList()
  }

  // --- Excel ---
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ imported?: number; skipped?: number; skippedRows?: { satir: number; neden: string; veri: string }[]; error?: string } | null>(null)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setUploadResult(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/animal-standards/import', { method: 'POST', body: form })
      const data = await res.json()
      setUploadResult(data)
    } catch (err: any) {
      setUploadResult({ error: `Yükleme hatası: ${err?.message ?? 'Ağ bağlantısını kontrol edin'}` })
    } finally {
      setUploading(false)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'ekle', label: '➕ Elle Ekle' },
    { key: 'liste', label: '📋 Kayıtları Gör' },
    { key: 'excel', label: '📂 Excel Yükle' },
  ]

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Hayvan Standartları</h1>
      <p className="text-gray-500 text-sm mb-6">Cins ve renk standartlarını yönetin.</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ELLE EKLE ── */}
      {tab === 'ekle' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hayvan Türü *</label>
              <select
                value={form.animalType}
                onChange={e => setForm({ ...form, animalType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400"
              >
                {ANIMAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Irk (opsiyonel)</label>
              <select
                value={form.breed}
                onChange={e => setForm({ ...form, breed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">— Yok —</option>
                <option value="DEV">DEV</option>
                <option value="CUCE">CUCE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cins (Species) *</label>
            <input
              value={form.species}
              onChange={e => setForm({ ...form, species: e.target.value })}
              placeholder="örn. Brahma"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Renk (Color) *</label>
            <input
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
              placeholder="örn. Altın Boyunlu"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || !form.species.trim() || !form.color.trim()}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Ekleniyor...' : '✓ Listeye Ekle'}
          </button>

          {saveResult && (
            <div className={`rounded-lg p-3 text-sm ${saveResult.error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              {saveResult.error ?? 'Kayıt başarıyla eklendi ✓'}
            </div>
          )}
        </div>
      )}

      {/* ── KAYITLARI GÖR ── */}
      {tab === 'liste' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cins veya renk ara..."
              className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400"
            />
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value); setPage(1) }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">Tüm türler</option>
              {ANIMAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={fetchList} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
              🔍 Ara
            </button>
          </div>

          {listLoading ? (
            <div className="text-center py-10 text-gray-400">Yükleniyor...</div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-3">Toplam {total.toLocaleString('tr-TR')} kayıt — sayfa {page}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="pb-2 pr-3">Tür</th>
                      <th className="pb-2 pr-3">Irk</th>
                      <th className="pb-2 pr-3">Cins</th>
                      <th className="pb-2 pr-3">Renk</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-1.5 pr-3 font-medium text-gray-700">{r.animalType}</td>
                        <td className="py-1.5 pr-3 text-gray-500">{r.breed ?? '—'}</td>
                        <td className="py-1.5 pr-3 text-gray-700">{r.species}</td>
                        <td className="py-1.5 pr-3 text-gray-600">{r.color}</td>
                        <td className="py-1.5 text-right">
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="text-xs text-red-500 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sayfalama */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Önceki
                </button>
                <span className="text-xs text-gray-500">
                  {page} / {Math.ceil(total / PER_PAGE) || 1}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * PER_PAGE >= total}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Sonraki →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── EXCEL YÜKLE ── */}
      {tab === 'excel' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
            <p className="font-medium mb-2">Excel dosyası formatı:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>AnimalType</strong> — TAVUK, HOROZ, ORDEK, GUVERCIN, TAVSAN, KAZ, HINDI, BILDIRCIN</li>
              <li><strong>Breed</strong> — Irk (opsiyonel): DEV veya CUCE</li>
              <li><strong>Species</strong> — Cins adı</li>
              <li><strong>Color</strong> — Renk adı</li>
            </ul>
            <p className="mt-2 text-xs text-red-600 font-medium">⚠️ Yükleme mevcut tüm standartları silip yeniden oluşturur.</p>
          </div>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Excel Dosyası (.xlsx, .xls)</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Yükleniyor...' : 'İçe Aktar'}
          </button>

          {uploadResult && (
            <div className="mt-4 space-y-3">
              {uploadResult.error ? (
                <div className="rounded-lg p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                  {uploadResult.error}
                </div>
              ) : (
                <div className="rounded-lg p-4 bg-green-50 border border-green-200 text-green-700 text-sm">
                  <p className="font-medium">✓ {uploadResult.imported?.toLocaleString('tr-TR')} standart içe aktarıldı.</p>
                  {(uploadResult.skipped ?? 0) > 0 && (
                    <p className="mt-1 text-amber-700">{uploadResult.skipped} satır atlandı (boş alan içeriyor).</p>
                  )}
                </div>
              )}

              {uploadResult.skippedRows && uploadResult.skippedRows.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-bold text-amber-800 mb-2">⚠️ Atlanan Satırlar ({uploadResult.skippedRows.length})</p>
                  <div className="overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-amber-700 border-b border-amber-200">
                          <th className="pb-1 pr-3">Excel Satırı</th>
                          <th className="pb-1 pr-3">Neden</th>
                          <th className="pb-1">Veri</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResult.skippedRows.map((r, i) => (
                          <tr key={i} className="border-b border-amber-100">
                            <td className="py-1 pr-3 text-amber-800 font-medium">{r.satir}. satır</td>
                            <td className="py-1 pr-3 text-red-600">{r.neden}</td>
                            <td className="py-1 text-amber-700">{r.veri}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
