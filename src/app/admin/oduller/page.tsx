'use client'

import { useEffect, useState } from 'react'

interface AwardType { id: number; name: string; active: boolean; order: number }

export default function OdullerPage() {
  const [awards, setAwards] = useState<AwardType[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const fetchAll = () => {
    setLoading(true)
    fetch('/api/award-types?all=true')
      .then(r => r.json())
      .then(setAwards)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    const maxOrder = awards.length > 0 ? Math.max(...awards.map(a => a.order)) + 1 : 0
    await fetch('/api/award-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), order: maxOrder }),
    })
    setNewName('')
    setAdding(false)
    fetchAll()
  }

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return
    await fetch(`/api/award-types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    setEditId(null)
    fetchAll()
  }

  const handleToggleActive = async (award: AwardType) => {
    await fetch(`/api/award-types/${award.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !award.active }),
    })
    fetchAll()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ödülü silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/award-types/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Ödül Türleri</h1>
      <p className="text-gray-500 mb-8">Yarışmalarda verilebilecek ödülleri yönetin.</p>

      {/* Yeni ödül ekle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Yeni Ödül Ekle</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Ödül adı (örn: Türkiye Şampiyonu)"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || adding}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {adding ? '...' : 'Ekle'}
          </button>
        </div>
      </div>

      {/* Mevcut ödüller */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">
          Ödül Listesi ({awards.length})
        </div>
        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : awards.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">Henüz ödül eklenmemiş.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {awards.map(award => (
              <div key={award.id} className="px-5 py-3 flex items-center gap-3">
                {editId === award.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdate(award.id)}
                      className="flex-1 px-3 py-1.5 border border-primary-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(award.id)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Kaydet</button>
                    <button onClick={() => setEditId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5">İptal</button>
                  </>
                ) : (
                  <>
                    <span className={`flex-1 text-sm ${award.active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                      {award.name}
                    </span>
                    <button
                      onClick={() => handleToggleActive(award)}
                      className={`text-xs px-2 py-1 rounded ${award.active ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {award.active ? 'Pasif' : 'Aktif'}
                    </button>
                    <button
                      onClick={() => { setEditId(award.id); setEditName(award.name) }}
                      className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(award.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                    >
                      Sil
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
