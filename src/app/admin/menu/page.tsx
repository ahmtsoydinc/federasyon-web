'use client'

import { useEffect, useState } from 'react'

interface Child {
  label: string
  href: string
  divider?: boolean
  newTab?: boolean
}

interface NavItem {
  id: number
  label: string
  href: string
  active: boolean
  newTab?: boolean
  children?: Child[]
}

const nextId = (items: NavItem[]) => Math.max(0, ...items.map(i => i.id)) + 1

export default function MenuPage() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Düzenleme modları
  const [editItem, setEditItem] = useState<NavItem | null>(null)
  const [editChild, setEditChild] = useState<{ parentId: number; index: number; child: Child } | null>(null)
  const [showNewItem, setShowNewItem] = useState(false)
  const [showNewChild, setShowNewChild] = useState<number | null>(null) // parentId

  const [newItem, setNewItem] = useState({ label: '', href: '/', newTab: false })
  const [newChild, setNewChild] = useState({ label: '', href: '/', newTab: false })

  useEffect(() => {
    fetch('/api/nav-menu').then(r => r.json()).then(data => { setItems(data); setLoading(false) })
  }, [])

  const save = async (updated: NavItem[]) => {
    setSaving(true); setMsg(null)
    const res = await fetch('/api/nav-menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setSaving(false)
    if (res.ok) { setMsg({ type: 'ok', text: '✓ Menü kaydedildi.' }); setItems(updated) }
    else setMsg({ type: 'err', text: '✗ Kayıt hatası.' })
  }

  const toggleActive = (id: number) => {
    const updated = items.map(i => i.id === id ? { ...i, active: !i.active } : i)
    save(updated)
  }

  const moveItem = (id: number, dir: -1 | 1) => {
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) return
    const arr = [...items]
    const swap = idx + dir
    if (swap < 0 || swap >= arr.length) return
    ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
    save(arr)
  }

  const deleteItem = (id: number) => {
    if (!confirm('Bu menü öğesini silmek istiyor musunuz?')) return
    save(items.filter(i => i.id !== id))
  }

  const addItem = () => {
    if (!newItem.label.trim()) return
    const updated = [...items, { ...newItem, id: nextId(items), active: true }]
    save(updated)
    setNewItem({ label: '', href: '/', newTab: false })
    setShowNewItem(false)
  }

  const saveEditItem = () => {
    if (!editItem) return
    save(items.map(i => i.id === editItem.id ? editItem : i))
    setEditItem(null)
  }

  // Alt menü (children) işlemleri
  const addChild = (parentId: number) => {
    if (!newChild.label.trim()) return
    const updated = items.map(i => {
      if (i.id !== parentId) return i
      return { ...i, children: [...(i.children || []), { ...newChild }] }
    })
    save(updated)
    setNewChild({ label: '', href: '/', newTab: false })
    setShowNewChild(null)
  }

  const deleteChild = (parentId: number, idx: number) => {
    const updated = items.map(i => {
      if (i.id !== parentId) return i
      const children = [...(i.children || [])]
      children.splice(idx, 1)
      return { ...i, children }
    })
    save(updated)
  }

  const moveChild = (parentId: number, idx: number, dir: -1 | 1) => {
    const updated = items.map(i => {
      if (i.id !== parentId) return i
      const children = [...(i.children || [])]
      const swap = idx + dir
      if (swap < 0 || swap >= children.length) return i
      ;[children[idx], children[swap]] = [children[swap], children[idx]]
      return { ...i, children }
    })
    save(updated)
  }

  const saveEditChild = () => {
    if (!editChild) return
    const updated = items.map(i => {
      if (i.id !== editChild.parentId) return i
      const children = [...(i.children || [])]
      children[editChild.index] = editChild.child
      return { ...i, children }
    })
    save(updated)
    setEditChild(null)
  }

  if (loading) return <div className="text-gray-400 p-8 text-center">Yükleniyor...</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menü Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Web sitesi üst menüsünü düzenleyin</p>
        </div>
        <button
          onClick={() => { setShowNewItem(true); setEditItem(null) }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          + Menü Öğesi Ekle
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Yeni öğe formu */}
      {showNewItem && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-primary-100">
          <h3 className="font-semibold text-gray-700 mb-3">Yeni Menü Öğesi</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Etiket *</label>
              <input
                value={newItem.label}
                onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                placeholder="Komisyonlar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Link *</label>
              <input
                value={newItem.href}
                onChange={e => setNewItem({ ...newItem, href: e.target.value })}
                placeholder="/sayfalar/komisyonlar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={newItem.newTab} onChange={e => setNewItem({ ...newItem, newTab: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm text-gray-600">Yeni sekmede aç</span>
          </label>
          <div className="flex gap-2 mt-3">
            <button onClick={addItem} disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 disabled:opacity-60">
              {saving ? 'Ekleniyor...' : 'Ekle'}
            </button>
            <button onClick={() => setShowNewItem(false)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm">İptal</button>
          </div>
        </div>
      )}

      {/* Menü listesi */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id} className={`bg-white rounded-xl shadow-sm border ${item.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
            {/* Ana öğe */}
            {editItem?.id === item.id ? (
              <div className="p-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Etiket</label>
                    <input
                      value={editItem.label}
                      onChange={e => setEditItem({ ...editItem, label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Link</label>
                    <input
                      value={editItem.href}
                      onChange={e => setEditItem({ ...editItem, href: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={editItem.newTab || false} onChange={e => setEditItem({ ...editItem, newTab: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm text-gray-600">Yeni sekmede aç</span>
                </label>
                <div className="flex gap-2 mt-3">
                  <button onClick={saveEditItem} disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 disabled:opacity-60">Kaydet</button>
                  <button onClick={() => setEditItem(null)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm">İptal</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveItem(item.id, -1)} disabled={idx === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-30 text-xs leading-none">▲</button>
                  <button onClick={() => moveItem(item.id, 1)} disabled={idx === items.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-30 text-xs leading-none">▼</button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm">{item.label}</div>
                  <div className="text-xs text-gray-400 truncate">{item.href}{item.newTab && ' ↗'}</div>
                  {item.children && item.children.length > 0 && (
                    <div className="text-xs text-primary-500 mt-0.5">{item.children.filter(c => !c.divider).length} alt öğe</div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(item.id)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {item.active ? 'Aktif' : 'Pasif'}
                  </button>
                  <button onClick={() => setEditItem(item)} className="text-primary-600 hover:text-primary-800 text-xs font-medium">Düzenle</button>
                  <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Sil</button>
                </div>
              </div>
            )}

            {/* Alt menü öğeleri */}
            {item.children && item.children.length > 0 && (
              <div className="border-t border-gray-50 px-4 pb-3">
                <div className="text-xs font-medium text-gray-400 mt-2 mb-1.5">Alt Menü Öğeleri</div>
                <div className="space-y-1 pl-3 border-l-2 border-primary-100">
                  {item.children.map((child, ci) => child.divider ? (
                    <div key={ci} className="text-xs text-gray-300 py-1">── Ayırıcı ──</div>
                  ) : editChild?.parentId === item.id && editChild.index === ci ? (
                    <div key={ci} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="grid sm:grid-cols-2 gap-2">
                        <input
                          value={editChild.child.label}
                          onChange={e => setEditChild({ ...editChild, child: { ...editChild.child, label: e.target.value } })}
                          placeholder="Etiket"
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <input
                          value={editChild.child.href}
                          onChange={e => setEditChild({ ...editChild, child: { ...editChild.child, href: e.target.value } })}
                          placeholder="Link"
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editChild.child.newTab || false} onChange={e => setEditChild({ ...editChild, child: { ...editChild.child, newTab: e.target.checked } })} className="w-3 h-3" />
                        <span className="text-xs text-gray-600">Yeni sekmede aç</span>
                      </label>
                      <div className="flex gap-2">
                        <button onClick={saveEditChild} disabled={saving} className="bg-primary-600 text-white px-3 py-1 rounded text-xs hover:bg-primary-700">Kaydet</button>
                        <button onClick={() => setEditChild(null)} className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-xs">İptal</button>
                      </div>
                    </div>
                  ) : (
                    <div key={ci} className="flex items-center gap-2 py-1">
                      <div className="flex flex-col gap-px">
                        <button onClick={() => moveChild(item.id, ci, -1)} disabled={ci === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-30 text-xs leading-none">▲</button>
                        <button onClick={() => moveChild(item.id, ci, 1)} disabled={ci === item.children!.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-30 text-xs leading-none">▼</button>
                      </div>
                      <span className="text-sm text-gray-700 flex-1">{child.label}</span>
                      <span className="text-xs text-gray-400">{child.href}{child.newTab && ' ↗'}</span>
                      <button onClick={() => setEditChild({ parentId: item.id, index: ci, child: { ...child } })} className="text-primary-600 hover:text-primary-800 text-xs">Düzenle</button>
                      <button onClick={() => deleteChild(item.id, ci)} className="text-red-400 hover:text-red-600 text-xs">Sil</button>
                    </div>
                  ))}
                </div>

                {/* Alt öğe ekleme */}
                {showNewChild === item.id ? (
                  <div className="mt-2 pl-3 bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input
                        value={newChild.label}
                        onChange={e => setNewChild({ ...newChild, label: e.target.value })}
                        placeholder="Etiket"
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <input
                        value={newChild.href}
                        onChange={e => setNewChild({ ...newChild, href: e.target.value })}
                        placeholder="/sayfa"
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newChild.newTab} onChange={e => setNewChild({ ...newChild, newTab: e.target.checked })} className="w-3 h-3" />
                      <span className="text-xs text-gray-600">Yeni sekmede aç</span>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => addChild(item.id)} disabled={saving} className="bg-primary-600 text-white px-3 py-1 rounded text-xs hover:bg-primary-700">Ekle</button>
                      <button onClick={() => setShowNewChild(null)} className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-xs">İptal</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowNewChild(item.id); setNewChild({ label: '', href: '/', newTab: false }) }}
                    className="mt-2 text-xs text-primary-600 hover:text-primary-800 ml-3"
                  >
                    + Alt öğe ekle
                  </button>
                )}
              </div>
            )}

            {/* Dropdown yoksa alt öğe ekleme butonu */}
            {(!item.children || item.children.length === 0) && (
              <div className="px-4 pb-3">
                {showNewChild === item.id ? (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-gray-500">Alt öğe eklersen bu menü bir dropdown olacak:</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input
                        value={newChild.label}
                        onChange={e => setNewChild({ ...newChild, label: e.target.value })}
                        placeholder="Etiket"
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm outline-none"
                      />
                      <input
                        value={newChild.href}
                        onChange={e => setNewChild({ ...newChild, href: e.target.value })}
                        placeholder="/sayfa"
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => addChild(item.id)} disabled={saving} className="bg-primary-600 text-white px-3 py-1 rounded text-xs hover:bg-primary-700">Ekle</button>
                      <button onClick={() => setShowNewChild(null)} className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-xs">İptal</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowNewChild(item.id); setNewChild({ label: '', href: '/', newTab: false }) }}
                    className="text-xs text-gray-400 hover:text-primary-600"
                  >
                    + Alt öğe ekle (dropdown yap)
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 bg-primary-700 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          Kaydediliyor...
        </div>
      )}
    </div>
  )
}
