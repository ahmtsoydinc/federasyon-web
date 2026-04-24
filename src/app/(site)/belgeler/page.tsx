export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Belgeler' }

export default async function BelgelerPage() {
  const documents = await prisma.document.findMany({ orderBy: { createdAt: 'desc' } })

  const grouped = documents.reduce<Record<string, typeof documents>>((acc, doc) => {
    const cat = doc.category || 'Diğer'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(doc)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Belgeler</h1>

      {documents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Belge bulunmuyor.</div>
      ) : (
        Object.entries(grouped).map(([cat, docs]) => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">{cat}</h2>
            <div className="space-y-2">
              {docs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="text-3xl">📄</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 group-hover:text-primary-700">{doc.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div className="text-primary-600 text-sm font-medium">İndir ↓</div>
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
