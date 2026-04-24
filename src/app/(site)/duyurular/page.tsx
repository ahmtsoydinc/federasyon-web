import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Duyurular' }

export default async function DuyurularPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ important: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Duyurular</h1>

      {announcements.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Duyuru bulunmuyor.</div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-5 rounded-xl border-l-4 ${
                ann.important ? 'bg-red-50 border-red-500' : 'bg-white border-primary-500 shadow-sm'
              }`}
            >
              {ann.important && (
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase mb-2 inline-block">⚠ Önemli</span>
              )}
              <h2 className="font-bold text-gray-800 text-lg mb-2">{ann.title}</h2>
              <p className="text-gray-600 leading-relaxed">{ann.content}</p>
              <div className="text-xs text-gray-400 mt-3">
                {new Date(ann.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
