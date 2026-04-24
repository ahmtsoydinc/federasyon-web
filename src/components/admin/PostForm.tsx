'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface PostFormProps {
  initial?: {
    id?: number
    title?: string
    content?: string
    excerpt?: string
    imageUrl?: string
    published?: boolean
    featured?: boolean
    categoryId?: number | null
  }
}

export default function PostForm({ initial = {} }: PostFormProps) {
  const [title, setTitle] = useState(initial.title || '')
  const [content, setContent] = useState(initial.content || '')
  const [excerpt, setExcerpt] = useState(initial.excerpt || '')
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || '')
  const [published, setPublished] = useState(initial.published ?? false)
  const [featured, setFeatured] = useState(initial.featured ?? false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const uploadImage = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'thumbnail') // 900×600 cover
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(`Görsel yükleme hatası: ${data.error || `HTTP ${res.status}`}`)
      } else {
        setImageUrl(data.url)
      }
    } catch (err) {
      setError(`Bağlantı hatası: ${err}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const method = initial.id ? 'PUT' : 'POST'
    const url = initial.id ? `/api/posts/${initial.id}` : '/api/posts'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, excerpt, imageUrl, published, featured }),
    })

    setSaving(false)
    if (res.ok) {
      router.push('/admin/haberler')
    } else {
      const d = await res.json()
      setError(d.error || 'Bir hata oluştu')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sol - içerik */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlık *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Haber başlığı"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Özet</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                placeholder="Kısa özet (opsiyonel)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İçerik *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={16}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-y font-mono text-sm"
                placeholder="Haber içeriği..."
              />
            </div>
          </div>
        </div>

        {/* Sağ - ayarlar */}
        <div className="space-y-4">
          {/* Yayın ayarları */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Yayın Ayarları</h3>

            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded text-primary-600"
              />
              <span className="text-sm text-gray-700">Yayınla</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded text-primary-600"
              />
              <span className="text-sm text-gray-700">Öne Çıkar</span>
            </label>
          </div>

          {/* Kapak görseli */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-3">Kapak Görseli</h3>

            {imageUrl && (
              <div className="mb-3 relative">
                <img src={imageUrl} alt="Kapak" className="w-full h-32 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              {uploading ? 'Yükleniyor...' : '+ Görsel Seç'}
            </button>

            <div className="mt-2">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-500"
                placeholder="ya da URL girin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Butonlar */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-60 text-sm"
        >
          {saving ? 'Kaydediliyor...' : initial.id ? 'Güncelle' : 'Kaydet'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 text-sm"
        >
          İptal
        </button>
      </div>
    </form>
  )
}
