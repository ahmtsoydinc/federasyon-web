'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  slug: string
  published: boolean
  featured: boolean
  createdAt: string
  category?: { name: string }
}

export default function HaberlerPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = () => {
    setLoading(true)
    fetch('/api/posts?admin=1&limit=50')
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPosts() }, [])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" haberini silmek istiyor musunuz?`)) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    fetchPosts()
  }

  const togglePublish = async (post: Post) => {
    await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    })
    fetchPosts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Haberler</h1>
        <Link
          href="/admin/haberler/yeni"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          + Yeni Haber
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Henüz haber eklenmemiş.</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Başlık</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Tarih</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{post.title}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {post.category?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(post)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        post.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {post.published ? '✓ Yayında' : 'Taslak'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/haberler/${post.id}`}
                        className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
