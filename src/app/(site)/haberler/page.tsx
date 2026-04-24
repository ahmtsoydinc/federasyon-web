import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Haberler' }

export default async function HaberlerPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Haberler</h1>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Henüz haber bulunmuyor.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/haberler/${post.slug}`}>
              <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group h-full flex flex-col">
                {post.imageUrl ? (
                  <div className="h-48 overflow-hidden">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-5xl">🐓</div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  {post.category && (
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full w-fit mb-2">{post.category.name}</span>
                  )}
                  <h2 className="font-bold text-gray-800 mb-2 group-hover:text-primary-700 line-clamp-2 flex-1">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>}
                  <div className="text-xs text-gray-400 mt-auto">
                    {new Date(post.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
