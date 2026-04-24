'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PostForm from '@/components/admin/PostForm'

export default function EditHaberPage() {
  const { id } = useParams()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((d) => { setPost(d); setLoading(false) })
  }, [id])

  if (loading) return <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
  if (!post || post.error) return <div className="p-8 text-center text-red-400">Haber bulunamadı.</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Haberi Düzenle</h1>
      <PostForm initial={post} />
    </div>
  )
}
