import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Denetim Kurulu' }

export default async function DenetimPage() {
  const members = await prisma.boardMember.findMany({
    where: { board: 'denetim' },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-10">Denetim Kurulu</h1>

      {members.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Kurul bilgisi bulunmuyor.</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map((m) => (
            <div key={m.id} className="bg-white rounded-xl shadow-sm p-5 text-center">
              {m.imageUrl ? (
                <img src={m.imageUrl} alt={m.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
              ) : (
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 mx-auto mb-3">
                  {m.name[0]}
                </div>
              )}
              <div className="font-semibold text-gray-800">{m.name}</div>
              <div className="text-sm text-gray-500 mt-0.5">{m.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
