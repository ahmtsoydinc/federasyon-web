'use client'

import { useEffect, useState } from 'react'

interface Branch {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  order: number
}

export default function BranslarPage() {
  const [items, setItems] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '', order: 0 })
  const [saving, setSaving] = useState(false)

  const fetch_ = () => {
    setLoading(true)
    fetch('/api/branches').then((r) => r.json()).then(setItems).finally(() => setLoading(false))
  }

  useEffect(() => { fetch_() }, [])

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    await fetch('/api/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setForm({ name: '', description: '', imageUrl: '', order: 0 })
    setShowForm(false)
    fetch_()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Branşı silmek istiyor musunuz?')) return
    await fetch(`/api/branches/${id}`, { method: 'DELETE' })
    fetch_()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Branşlar</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          + Branş Ekle
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Yeni Branş</h2>
          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Branş adı"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Açıklama (opsiyonel)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="Görsel URL (opsiyonel)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Branş bulunmuyor.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((b) => (
              <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-gray-800">{b.name}</div>
                  {b.description && <p className="text-sm text-gray-500 mt-0.5">{b.description}</p>}
                </div>
                <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Sil</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
