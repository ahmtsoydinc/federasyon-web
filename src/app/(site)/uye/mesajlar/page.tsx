'use client'

import { useEffect, useState } from 'react'

export default function MesajlarPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  const fetchMessages = () => {
    fetch('/api/messages')
      .then(r => r.json())
      .then(setMessages)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMessages() }, [])

  const openMessage = async (item: any) => {
    setSelected(item)
    if (!item.read) {
      await fetch(`/api/messages/${item.messageId}/read`, { method: 'POST' })
      fetchMessages()
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Yükleniyor...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="md:hidden text-primary-600 text-sm font-medium flex items-center gap-1"
          >
            ← Listeye Dön
          </button>
        )}
        {!selected && <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Mesajlarım</h1>}
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-3">✉️</div>
          <p className="text-gray-500">Henüz mesajınız yok.</p>
        </div>
      ) : (
        <div className="md:grid md:grid-cols-2 md:gap-6">
          {/* Liste — mobilde selected varsa gizle */}
          <div className={`space-y-2 ${selected ? 'hidden md:block' : 'block'}`}>
            {messages.map(item => (
              <button
                key={item.id}
                onClick={() => openMessage(item)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?.id === item.id
                    ? 'border-primary-400 bg-primary-50'
                    : 'bg-white border-gray-100 hover:border-primary-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    {!item.read && <span className="mt-1 w-2 h-2 bg-primary-600 rounded-full shrink-0" />}
                    <div>
                      <div className={`text-sm font-medium ${!item.read ? 'text-gray-800' : 'text-gray-600'}`}>
                        {item.message?.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {item.message?.senderName} · {new Date(item.message?.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                  {!item.read && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full shrink-0">Yeni</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Mesaj detayı — mobilde selected yoksa gizle */}
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-gray-800 text-base sm:text-lg mb-2">{selected.message?.title}</h2>
              <div className="text-xs text-gray-400 mb-4">
                Gönderen: {selected.message?.senderName} · {new Date(selected.message?.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selected.message?.content}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6 items-center justify-center text-gray-400 text-sm">
              Okumak için bir mesaj seçin
            </div>
          )}
        </div>
      )}
    </div>
  )
}
