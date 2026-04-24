'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Announcement {
  id: number
  title: string
  content: string
  important: boolean
  createdAt: string
}

export default function DuyurularPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', important: false })
  const [saving, setSaving] = useState(false)

  const fetch_ = () => {
    setLoading(true)
    fetch('/api/announcements')
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch_() }, [])

  const handleSave = async () => {
    if (!form.title || !form.content) return
    setSaving(true)
    await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setForm({ title: '', content: '', important: false })
    setShowForm(false)
    fetch_()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Duyuruyu silmek istiyor musunuz?')) return
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    fetch_()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Duyurular</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          + Yeni Duyuru
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Yeni Duyuru Ekle</h2>
          <div className="space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Duyuru başlığı"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Duyuru içeriği"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.important}
                onChange={(e) => setForm({ ...form, important: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">⚠ Önemli duyuru olarak işaretle</span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Duyuru bulunmuyor.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.important && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">⚠ Önemli</span>
                    )}
                    <span className="font-semibold text-gray-800 text-sm">{item.title}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium shrink-0"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
