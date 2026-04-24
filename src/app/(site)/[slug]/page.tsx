import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DinamikSayfa({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } })
  if (!page) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
        {page.title}
      </h1>

      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* PDF Eki */}
      {page.pdfUrl && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3v-1h5v1H8z"/>
            </svg>
            <span className="font-semibold text-gray-700">Ek Belge</span>
          </div>

          {/* PDF Görüntüleyici */}
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-3" style={{ height: '700px' }}>
            <iframe
              src={`${page.pdfUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full"
              title={page.title + ' — PDF'}
            />
          </div>

          {/* İndirme butonu */}
          <a
            href={page.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            PDF İndir
          </a>
        </div>
      )}
    </div>
  )
}
