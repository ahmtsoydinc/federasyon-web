'use client'

import { useEffect, useState } from 'react'

interface Member {
  id: number
  name: string
  email: string
  phone: string | null
  active: boolean
  approved: boolean
  createdAt: string
  association: { name: string }
}

export default function UyelerPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchMembers = () => {
    setLoading(true)
    fetch('/api/admin/members')
      .then(r => r.json())
      .then(setMembers)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMembers() }, [])

  const toggleActive = async (id: number, active: boolean) => {
    await fetch(`/api/admin/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    fetchMembers()
  }

  const toggleApproved = async (id: number, approved: boolean) => {
    await fetch(`/api/admin/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !approved }),
    })
    fetchMembers()
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" üyesini kalıcı olarak silmek istiyor musunuz?\n\nBu işlem geri alınamaz.`)) return
    setDeleteError(null)
    const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setDeleteError(data.error || 'Silme işlemi başarısız')
      return
    }
    fetchMembers()
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.association.name.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount = members.filter(m => !m.approved).length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Üyeler</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Toplam {members.length} üye
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">· {pendingCount} onay bekliyor</span>
            )}
          </p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="İsim, e-posta veya dernek ara..."
          className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm w-64"
        />
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4 flex items-center justify-between">
          <span>⚠️ {deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600 ml-4 font-bold">×</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {search ? 'Arama sonucu bulunamadı.' : 'Henüz kayıtlı üye yok.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ad Soyad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">E-posta</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Telefon</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Dernek</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Kayıt</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Onay</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(m => (
                  <tr key={m.id} className={`hover:bg-gray-50 ${!m.active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{m.email}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{m.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{m.association.name}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">
                      {new Date(m.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleApproved(m.id, m.approved)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          m.approved
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        {m.approved ? '✓ Onaylı' : '⏳ Bekliyor'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(m.id, m.active)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          m.active
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {m.active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
