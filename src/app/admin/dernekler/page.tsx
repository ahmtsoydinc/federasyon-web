'use client'

import { useEffect, useState, useRef } from 'react'
import * as XLSX from 'xlsx'

interface Association {
  id: number
  name: string
  city: string | null
  active: boolean
  isBireysel: boolean
  _count: { members: number }
}

interface ImportRow {
  name: string
  city: string
}

interface PresidentForm {
  assocId: number | null
  name: string
  email: string
  password: string
}

const emptyAssocForm = { name: '', city: '' }

export default function DerneklerPage() {
  const [assocs, setAssocs] = useState<Association[]>([])
  const [loading, setLoading] = useState(true)

  // Ekleme formu
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState(emptyAssocForm)
  const [savingAdd, setSavingAdd] = useState(false)

  // Düzenleme formu
  const [editAssoc, setEditAssoc] = useState<Association | null>(null)
  const [editForm, setEditForm] = useState(emptyAssocForm)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editSuccess, setEditSuccess] = useState('')

  // Excel import
  const [showImport, setShowImport] = useState(false)
  const [importRows, setImportRows] = useState<ImportRow[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ added: number; skipped: number; skippedNames: string[] } | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  // Başkan formu
  const [presidentForm, setPresidentForm] = useState<PresidentForm>({ assocId: null, name: '', email: '', password: '' })
  const [savingPresident, setSavingPresident] = useState(false)
  const [presidentError, setPresidentError] = useState('')
  const [presidentSuccess, setPresidentSuccess] = useState('')

  // Excel dosyasını parse et
  const handleExcelFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        // header: 1 → diziler döner; header: 'A' → obje döner
        const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        if (raw.length < 2) { setImportError('Excel dosyası boş veya başlık satırı yok.'); return }

        // İlk satır başlık → bul hangi sütun ne
        const headers = raw[0].map(h => String(h).toLowerCase().trim())
        const nameIdx = headers.findIndex(h =>
          h.includes('dernek') || h.includes('ad') || h === 'name'
        )
        const cityIdx = headers.findIndex(h =>
          h.includes('şehir') || h.includes('sehir') || h.includes('il') || h === 'city'
        )

        if (nameIdx === -1) {
          setImportError('Dernek adı sütunu bulunamadı. Başlık satırında "Dernek Adı" veya "Ad" yazmalıdır.')
          return
        }

        const rows: ImportRow[] = []
        for (let i = 1; i < raw.length; i++) {
          const name = String(raw[i][nameIdx] ?? '').trim()
          if (!name) continue
          const city = cityIdx >= 0 ? String(raw[i][cityIdx] ?? '').trim() : ''
          rows.push({ name, city })
        }

        if (rows.length === 0) { setImportError('Veri satırı bulunamadı.'); return }
        setImportRows(rows)
      } catch {
        setImportError('Dosya okunamadı. Geçerli bir Excel (.xlsx / .xls) dosyası yükleyin.')
      }
    }
    reader.readAsArrayBuffer(file)
    // input'u sıfırla ki aynı dosya tekrar seçilebilsin
    e.target.value = ''
  }

  const handleImport = async () => {
    if (importRows.length === 0) return
    setImporting(true)
    setImportResult(null)
    const res = await fetch('/api/associations/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: importRows }),
    })
    const data = await res.json()
    setImporting(false)
    if (!res.ok) { setImportError(data.error || 'İçe aktarma hatası'); return }
    setImportResult(data)
    setImportRows([])
    fetchAssocs()
  }

  const handleCancelImport = () => {
    setImportRows([])
    setImportError(null)
    setImportResult(null)
    setShowImport(false)
    if (importFileRef.current) importFileRef.current.value = ''
  }

  const fetchAssocs = () => {
    setLoading(true)
    fetch('/api/associations')
      .then(r => r.json())
      .then(setAssocs)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAssocs() }, [])

  const handleAddAssoc = async () => {
    if (!addForm.name) return
    setSavingAdd(true)
    await fetch('/api/associations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    setSavingAdd(false)
    setAddForm(emptyAssocForm)
    setShowAddForm(false)
    fetchAssocs()
  }

  const openEdit = (a: Association) => {
    setEditAssoc(a)
    setEditForm({ name: a.name, city: a.city || '' })
    setEditSuccess('')
  }

  const handleSaveEdit = async () => {
    if (!editAssoc || !editForm.name) return
    setSavingEdit(true)
    const res = await fetch(`/api/associations/${editAssoc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editForm.name, city: editForm.city || null, active: editAssoc.active }),
    })
    setSavingEdit(false)
    if (res.ok) {
      setEditSuccess('Güncellendi.')
      fetchAssocs()
      setTimeout(() => { setEditAssoc(null); setEditSuccess('') }, 1500)
    }
  }

  const handleToggleActive = async (a: Association) => {
    const label = a.active ? 'pasifleştirmek' : 'aktifleştirmek'
    if (!confirm(`Bu derneği ${label} istiyor musunuz?`)) return
    await fetch(`/api/associations/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: a.name, city: a.city, active: !a.active, isBireysel: a.isBireysel }),
    })
    fetchAssocs()
  }

  const handleToggleBireysel = async (a: Association) => {
    const label = a.isBireysel ? 'kurumsal üye' : 'bireysel üye'
    if (!confirm(`Bu derneği "${label}" olarak işaretlemek istiyor musunuz?`)) return
    await fetch(`/api/associations/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: a.name, city: a.city, active: a.active, isBireysel: !a.isBireysel }),
    })
    fetchAssocs()
  }

  const handleAddPresident = async () => {
    setPresidentError('')
    setPresidentSuccess('')
    if (!presidentForm.assocId || !presidentForm.name || !presidentForm.email || !presidentForm.password) {
      setPresidentError('Tüm alanlar zorunludur')
      return
    }
    setSavingPresident(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: presidentForm.name,
        email: presidentForm.email,
        password: presidentForm.password,
        role: 'president',
        associationId: presidentForm.assocId,
      }),
    })
    const data = await res.json()
    setSavingPresident(false)
    if (!res.ok) { setPresidentError(data.error || 'Hata oluştu'); return }
    setPresidentSuccess(`✓ ${presidentForm.name} başkan olarak tanımlandı. Giriş: /baskan/giris`)
    setPresidentForm({ assocId: null, name: '', email: '', password: '' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dernekler</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowImport(!showImport); setShowAddForm(false); setEditAssoc(null); setImportRows([]); setImportError(null); setImportResult(null) }}
            className="border border-green-600 text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📥 Excel'den Aktar
          </button>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setShowImport(false); setEditAssoc(null) }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            + Dernek Ekle
          </button>
        </div>
      </div>

      {/* Excel Import Modülü */}
      {showImport && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-green-100">
          <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <span>📥</span> Excel'den Toplu Dernek Aktarımı
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Excel dosyanızda en az bir <strong>Dernek Adı</strong> sütunu olmalıdır.
            Şehir bilgisi için <strong>Şehir</strong> veya <strong>İl</strong> sütunu ekleyebilirsiniz.
            Zaten var olan dernekler otomatik olarak atlanır.
          </p>

          {/* Örnek format */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600">
            <div className="font-semibold mb-1 text-gray-700">Örnek Excel Formatı:</div>
            <table className="border-collapse">
              <thead>
                <tr className="bg-primary-100 text-primary-800">
                  <th className="border border-gray-300 px-3 py-1">Dernek Adı</th>
                  <th className="border border-gray-300 px-3 py-1">Şehir</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 px-3 py-1">Ankara Süs Tavukları Derneği</td><td className="border border-gray-300 px-3 py-1">Ankara</td></tr>
                <tr><td className="border border-gray-300 px-3 py-1">İstanbul Kanatlı Hayvanlar Derneği</td><td className="border border-gray-300 px-3 py-1">İstanbul</td></tr>
              </tbody>
            </table>
          </div>

          {/* Dosya seçici */}
          {importRows.length === 0 && !importResult && (
            <label className="cursor-pointer inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Excel Dosyası Seç (.xlsx / .xls)
              <input
                ref={importFileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelFile}
              />
            </label>
          )}

          {/* Hata */}
          {importError && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              ⚠️ {importError}
              <button onClick={() => setImportError(null)} className="ml-3 text-red-400 hover:text-red-600 text-xs">Kapat</button>
            </div>
          )}

          {/* Sonuç */}
          {importResult && (
            <div className="mt-3 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">
              <div className="font-semibold">✓ Aktarım tamamlandı!</div>
              <div className="mt-1">Eklenen: <strong>{importResult.added}</strong> dernek</div>
              {importResult.skipped > 0 && (
                <div className="mt-1 text-amber-700">
                  Atlandı (zaten mevcut): <strong>{importResult.skipped}</strong> dernek
                  <div className="text-xs mt-1 text-amber-600">{importResult.skippedNames.join(', ')}</div>
                </div>
              )}
              <button onClick={handleCancelImport} className="mt-2 text-green-700 underline text-xs">Kapat</button>
            </div>
          )}

          {/* Önizleme tablosu */}
          {importRows.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">
                  Önizleme — <span className="text-primary-700">{importRows.length} dernek</span> aktarılacak
                </div>
                <button
                  onClick={() => { setImportRows([]); if (importFileRef.current) importFileRef.current.value = '' }}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  ✕ Temizle
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">#</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Dernek Adı</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Şehir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {importRows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-3 py-2 text-gray-800">{row.name}</td>
                        <td className="px-3 py-2 text-gray-500">{row.city || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
                >
                  {importing ? 'Aktarılıyor...' : `✓ ${importRows.length} Derneği İçe Aktar`}
                </button>
                <button
                  onClick={handleCancelImport}
                  className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ekleme formu */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Yeni Dernek</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dernek Adı *</label>
              <input
                value={addForm.name}
                onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Dernek adı"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Şehir</label>
              <input
                value={addForm.city}
                onChange={e => setAddForm({ ...addForm, city: e.target.value })}
                placeholder="Şehir (opsiyonel)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAddAssoc} disabled={savingAdd}
              className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60">
              {savingAdd ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button onClick={() => setShowAddForm(false)} className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">İptal</button>
          </div>
        </div>
      )}

      {/* Düzenleme formu */}
      {editAssoc && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Dernek Düzenle — <span className="text-primary-700">{editAssoc.name}</span></h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dernek Adı *</label>
              <input
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Şehir</label>
              <input
                value={editForm.city}
                onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                placeholder="Şehir"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
              />
            </div>
          </div>
          {editSuccess && <div className="mt-3 text-green-700 text-sm font-medium">✓ {editSuccess}</div>}
          <div className="flex gap-3 mt-4">
            <button onClick={handleSaveEdit} disabled={savingEdit}
              className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60">
              {savingEdit ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
            <button onClick={() => { setEditAssoc(null); setEditSuccess('') }}
              className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">İptal</button>
          </div>
        </div>
      )}

      {/* Dernek listesi */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
        ) : assocs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Dernek bulunmuyor.</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Dernek Adı</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Şehir</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Üye Sayısı</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Durum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Tür</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assocs.map(a => (
                <tr key={a.id} className={`hover:bg-gray-50 ${editAssoc?.id === a.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-800">{a.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{a.city || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{a._count.members} üye</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {a.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.isBireysel ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}`}>
                      {a.isBireysel ? '👤 Bireysel' : '🏢 Kurumsal'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => { openEdit(a); setShowAddForm(false) }}
                      className="text-primary-600 hover:text-primary-800 text-xs font-medium">Düzenle</button>
                    <button onClick={() => handleToggleActive(a)}
                      className={`text-xs font-medium ${a.active ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}>
                      {a.active ? 'Pasifleştir' : 'Aktifleştir'}
                    </button>
                    <button onClick={() => handleToggleBireysel(a)}
                      className={`text-xs font-medium ${a.isBireysel ? 'text-blue-600 hover:text-blue-800' : 'text-orange-500 hover:text-orange-700'}`}>
                      {a.isBireysel ? '→ Kurumsal' : '→ Bireysel'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Başkan tanımlama */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 text-lg mb-2">Dernek Başkanı Tanımla</h2>
        <p className="text-sm text-gray-500 mb-5">
          Tanımlanan başkanlar <strong>/baskan/giris</strong> adresinden giriş yaparak kendi derneklerinin bilezik siparişlerini onaylayabilir.
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dernek *</label>
            <select
              value={presidentForm.assocId || ''}
              onChange={e => setPresidentForm({ ...presidentForm, assocId: Number(e.target.value) || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
            >
              <option value="">-- Dernek seçin --</option>
              {assocs.filter(a => a.active).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad *</label>
            <input
              value={presidentForm.name}
              onChange={e => setPresidentForm({ ...presidentForm, name: e.target.value })}
              placeholder="Başkanın adı soyadı"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">E-posta (giriş için) *</label>
            <input
              type="email"
              value={presidentForm.email}
              onChange={e => setPresidentForm({ ...presidentForm, email: e.target.value })}
              placeholder="baskan@dernek.org"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Şifre *</label>
            <input
              type="password"
              value={presidentForm.password}
              onChange={e => setPresidentForm({ ...presidentForm, password: e.target.value })}
              placeholder="Geçici şifre belirleyin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {presidentError && <div className="mt-3 bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{presidentError}</div>}
        {presidentSuccess && <div className="mt-3 bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg">{presidentSuccess}</div>}

        <button
          onClick={handleAddPresident}
          disabled={savingPresident}
          className="mt-4 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
        >
          {savingPresident ? 'Kaydediliyor...' : '🏛 Başkan Olarak Tanımla'}
        </button>
      </div>
    </div>
  )
}
