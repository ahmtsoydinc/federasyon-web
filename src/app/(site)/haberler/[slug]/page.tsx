import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  return { title: post?.title || 'Haber' }
}

export default async function HaberDetayPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
    include: { category: true },
  })

  if (!post) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/haberler" className="hover:text-primary-600">Haberler</Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{post.title}</span>
      </div>

      {post.category && (
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{post.category.name}</span>
      )}

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mt-4 mb-4">{post.title}</h1>

      <div className="text-sm text-gray-400 mb-8">
        {new Date(post.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      {post.imageUrl && (
        <img src={post.imageUrl} alt={post.title} className="w-full h-48 sm:h-72 object-cover rounded-xl mb-8" />
      )}

      <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      <div className="mt-12 pt-6 border-t border-gray-100">
        <Link href="/haberler" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
          ← Tüm Haberler
        </Link>
      </div>
    </div>
  )
}
