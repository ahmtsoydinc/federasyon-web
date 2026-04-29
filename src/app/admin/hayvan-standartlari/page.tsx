'use client'

import { useState } from 'react'

export default function HayvanStandartlariPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported?: number; error?: string } | null>(null)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/animal-standards/import', { method: 'POST', body: form })
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: `Yükleme sırasında bir hata oluştu: ${err?.message ?? 'Ağ bağlantısını kontrol edin'}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Hayvan Standartları</h1>
      <p className="text-gray-500 mb-8">Excel dosyası yükleyerek hayvan cins ve renk standartlarını içe aktarın.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Excel Dosyası Yükle</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          <p className="font-medium mb-2">Excel dosyası formatı:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>AnimalType</strong> — Hayvan türü: TAVUK, HOROZ, ORDEK, GUVERCIN, TAVSAN, KAZ, HINDI, BILDIRCIN</li>
            <li><strong>Breed</strong> — Irk (opsiyonel): DEV veya CUCE</li>
            <li><strong>Species</strong> — Cins adı</li>
            <li><strong>Color</strong> — Renk adı</li>
          </ul>
          <p className="mt-2 text-xs text-blue-600">Not: Yükleme mevcut tüm standartları siler ve yeniden oluşturur.</p>
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
          disabled={!file || loading}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Yükleniyor...' : 'İçe Aktar'}
        </button>
      </div>

      {result && (
        <div className={`rounded-lg p-4 ${result.error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {result.error ? (
            <p>{result.error}</p>
          ) : (
            <p className="font-medium">{result.imported?.toLocaleString('tr-TR')} standart başarıyla içe aktarıldı.</p>
          )}
        </div>
      )}
    </div>
  )
}
