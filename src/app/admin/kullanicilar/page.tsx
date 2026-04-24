'use client'

import { useEffect, useState } from 'react'

interface User {
  id: number
  name: string
  email: string
  role: string
  permissions: string
  createdAt: string
}

const emptyForm = { name: '', email: '', password: '', role: 'editor' }

const roleLabel: Record<string, string> = {
  superadmin: 'Süper Admin',
  editor: 'Editör',
  president: 'Başkan',
}

const roleBadge: Record<string, string> = {
  superadmin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  president: 'bg-green-100 text-green-700',
}

// Admin panel modülleri ve açıklamaları
const MODULES = [
  { key: 'haberler',     label: '📰 Haberler',          desc: 'Haber ekleme/düzenleme' },
  { key: 'duyurular',    label: '📢 Duyurular',          desc: 'Duyuru ekleme/düzenleme' },
  { key: 'belgeler',     label: '📂 Belgeler',           desc: 'Belge yükleme/silme' },
  { key: 'slider',       label: '🖼 Slider',             desc: 'Ana sayfa slayt yönetimi' },
  { key: 'sayfalar',     label: '📄 Sayfalar',           desc: 'Özel sayfa oluşturma' },
  { key: 'yonetim',      label: '🏛 Yönetim Kadrosu',   desc: 'Kurul üyesi ekleme/düzenleme' },
  { key: 'branslar',     label: '🌿 Branşlar',           desc: 'Branş ekleme/düzenleme' },
  { key: 'dernekler',    label: '🏢 Dernekler',          desc: 'Dernek yönetimi' },
  { key: 'uyeler',       label: '👥 Üyeler',             desc: 'Üye görüntüleme' },
  { key: 'bilezik',      label: '💎 Bilezik Sistemi',    desc: 'Siparişler ve fiyat yönetimi' },
  { key: 'mesaj',        label: '✉️ Mesaj Gönder',       desc: 'Üyelere mesaj gönderme' },
  { key: 'sponsorlar',   label: '🏆 Sponsorlar',         desc: 'Sponsor ekleme/düzenleme' },
  { key: 'menu',         label: '🗂 Menü Yönetimi',      desc: 'Site menüsü düzenleme' },
  { key: 'site-ayarlari',label: '📱 Sosyal Medya',       desc: 'Sosyal medya ayarları' },
]

export default function KullanicilarPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Yetki paneli
  const [permUser, setPermUser] = useState<User | null>(null)
  const [permList, setPermList] = useState<string[]>([])
  const [permSaving, setPermSaving] = useState(false)

  const fetch_ = () => {
    setLoading(true)
    fetch('/api/users').then(r => r.json()).then(setUsers).finally(() => setLoading(false))
  }

  useEffect(() => { fetch_() }, [])

  const openAdd = () => {
    setForm(emptyForm); setEditId(null); setError(''); setSuccess(''); setShowForm(true); setPermUser(null)
  }

  const openEdit = (u: User) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setEditId(u.id); setError(''); setSuccess(''); setShowForm(true); setPermUser(null)
  }

  const openPerms = (u: User) => {
    let perms: string[] = []
    try { perms = JSON.parse(u.permissions || '[]') } catch {}
    setPermUser(u)
    setPermList(perms)
    setShowForm(false)
  }

  const handleSave = async () => {
    setError(''); setSuccess('')
    if (!form.name || !form.email) { setError('Ad ve e-posta zorunludur'); return }
    if (!editId && !form.password) { setError('Yeni kullanıcı için şifre zorunludur'); return }
    setSaving(true)
    const res = editId
      ? await fetch(`/api/users/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      : await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Hata oluştu'); return }
    setSuccess(editId ? 'Kullanıcı güncellendi.' : 'Kullanıcı oluşturuldu.')
    setForm(emptyForm); setEditId(null); setShowForm(false)
    fetch_()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kullanıcıyı silmek istiyor musunuz?')) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Silinemedi'); return }
    fetch_()
  }

  const handlePermSave = async () => {
    if (!permUser) return
    setPermSaving(true)
    await fetch(`/api/users/${permUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: permUser.name,
        email: permUser.email,
        role: permUser.role,
        permissions: permList,
      }),
    })
    setPermSaving(false)
    setPermUser(null)
    fetch_()
  }

  const togglePerm = (key: string) => {
    setPermList(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])
  }

  const getPerms = (u: User): string[] => {
    try { return JSON.parse(u.permissions || '[]') } catch { return [] }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kullanıcılar</h1>
        <button onClick={openAdd} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
          + Kullanıcı Ekle
        </button>
      </div>

      {success && !showForm && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-200 mb-4">✓ {success}</div>
      )}

      {/* Kullanıcı ekleme/düzenleme formu */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">{editId ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ad Soyad" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-posta *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="eposta@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Şifre {editId ? <span className="text-gray-400 font-normal">(boş bırakılırsa değişmez)</span> : '*'}
              </label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder={editId ? 'Yeni şifre (opsiyonel)' : 'Şifre'} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rol *</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm">
                <option value="editor">Editör (kısıtlı erişim)</option>
                <option value="superadmin">Süper Admin (tam erişim)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60">
              {saving ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Kaydet'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); setError('') }}
              className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Yetki yönetimi paneli */}
      {permUser && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-primary-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">🔐 Yetki Yönetimi — {permUser.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Hangi admin sayfalarına erişebileceğini seçin</p>
            </div>
            <button onClick={() => setPermUser(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
          </div>

          {permUser.role === 'superadmin' ? (
            <div className="bg-purple-50 text-purple-700 text-sm px-4 py-3 rounded-lg">
              👑 Süper Admin hesabı — tüm sayfalara otomatik olarak erişimi var, ayrıca yetki verilmesine gerek yok.
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                {MODULES.map(m => (
                  <label key={m.key} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    permList.includes(m.key) ? 'bg-primary-50 border-primary-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={permList.includes(m.key)}
                      onChange={() => togglePerm(m.key)}
                      className="mt-0.5 w-4 h-4 accent-primary-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{m.label}</div>
                      <div className="text-xs text-gray-400">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handlePermSave} disabled={permSaving}
                  className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60">
                  {permSaving ? 'Kaydediliyor...' : '✓ Yetkileri Kaydet'}
                </button>
                <button onClick={() => setPermList(MODULES.map(m => m.key))} className="text-xs text-primary-600 hover:underline">
                  Tümünü seç
                </button>
                <button onClick={() => setPermList([])} className="text-xs text-gray-400 hover:underline">
                  Tümünü kaldır
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Kullanıcı tablosu */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Kullanıcı bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ad Soyad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">E-posta</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Yetkiler</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => {
                  const perms = getPerms(u)
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[u.role] || 'bg-gray-100 text-gray-600'}`}>
                          {roleLabel[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {u.role === 'superadmin' ? (
                          <span className="text-xs text-purple-500">Tüm erişim</span>
                        ) : perms.length === 0 ? (
                          <span className="text-xs text-red-400">⚠ Hiç yetki yok</span>
                        ) : (
                          <span className="text-xs text-gray-500">{perms.length} modül yetkisi</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        {u.role !== 'superadmin' && (
                          <button onClick={() => openPerms(u)} className="text-amber-600 hover:text-amber-800 text-xs font-medium">
                            🔐 Yetkiler
                          </button>
                        )}
                        <button onClick={() => openEdit(u)} className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                          Düzenle
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                          Sil
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
