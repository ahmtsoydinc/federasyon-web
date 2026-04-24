'use client'

import { useEffect, useState } from 'react'

interface Association { id: number; name: string }
interface Member { id: number; name: string; email: string; association: { name: string } }
interface SentMessage { id: number; title: string; targetType: string; targetId: number | null; senderName: string; createdAt: string }

export default function MesajGonderPage() {
  const [associations, setAssociations] = useState<Association[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([])
  const [form, setForm] = useState({ title: '', content: '', targetType: 'all', targetId: '' })
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'send' | 'history'>('send')

  useEffect(() => {
    fetch('/api/associations').then(r => r.json()).then(setAssociations)
    fetch('/api/admin/members').then(r => r.json()).then(setMembers)
    fetch('/api/messages').then(r => r.json()).then(setSentMessages)
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!form.title || !form.content) { setError('Başlık ve içerik zorunludur'); return }
    if ((form.targetType === 'association' || form.targetType === 'member') && !form.targetId) {
      setError('Lütfen hedef seçin'); return
    }

    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        targetType: form.targetType,
        targetId: form.targetId ? Number(form.targetId) : null,
      }),
    })
    const data = await res.json()
    setSending(false)

    if (!res.ok) { setError(data.error || 'Gönderim başarısız'); return }

    setMessage(`✓ Mesaj ${data.sent} üyeye iletildi.`)
    setForm({ title: '', content: '', targetType: 'all', targetId: '' })
    fetch('/api/messages').then(r => r.json()).then(setSentMessages)
  }

  const targetTypeLabel: Record<string, string> = {
    all: 'Tüm Üyeler',
    association: 'Dernek Üyeleri',
    member: 'Belirli Üye',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mesaj Gönder</h1>

      {/* Sekme */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {[{ key: 'send', label: '✉️ Yeni Mesaj' }, { key: 'history', label: '📋 Gönderilen Mesajlar' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'send' ? (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleSend} className="space-y-5">

              {/* Hedef kitlesi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alıcılar *</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { val: 'all', label: '👥 Tüm Üyeler', desc: `${members.length} kişi` },
                    { val: 'association', label: '🏢 Derneğe Göre', desc: '' },
                    { val: 'member', label: '👤 Tek Üye', desc: '' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setForm({ ...form, targetType: opt.val, targetId: '' })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.targetType === opt.val
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-700">{opt.label}</div>
                      {opt.desc && <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>}
                    </button>
                  ))}
                </div>

                {form.targetType === 'association' && (
                  <select
                    value={form.targetId}
                    onChange={e => setForm({ ...form, targetId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  >
                    <option value="">-- Dernek seçin --</option>
                    {associations.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                )}

                {form.targetType === 'member' && (
                  <select
                    value={form.targetId}
                    onChange={e => setForm({ ...form, targetId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  >
                    <option value="">-- Üye seçin --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.association?.name})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Başlık */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mesaj Başlığı *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Mesaj başlığı"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              {/* İçerik */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mesaj İçeriği *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  placeholder="Üyelere iletmek istediğiniz mesajı buraya yazın..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-y"
                />
              </div>

              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
              {message && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">{message}</div>}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
              >
                {sending ? 'Gönderiliyor...' : '✉️ Mesajı Gönder'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Gönderilen mesajlar */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {sentMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Henüz mesaj gönderilmemiş.</div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Başlık</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Alıcılar</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Gönderen</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sentMessages.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{m.title}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {targetTypeLabel[m.targetType] || m.targetType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{m.senderName}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(m.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      )}
    </div>
  )
}
