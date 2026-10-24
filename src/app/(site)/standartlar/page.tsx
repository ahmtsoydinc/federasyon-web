'use client'

import { useEffect, useState, useRef } from 'react'

interface StandardImage {
  id: number
  url: string
  caption?: string
  order: number
}

interface Standard {
  id: number
  name: string
  subtitle?: string
  breedPdfUrl?: string
  colourPdfUrl?: string
  breedDate?: string
  colourDate?: string
  isDraft: boolean
  order: number
  images: StandardImage[]
}

interface Category {
  id: number
  slug: string
  label: string
  fullTitle: string
  color: string
  order: number
  standards: Standard[]
}

type FilterMode = 'all' | 'breed' | 'colour' | 'recent'

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  '#1d4ed8': '#fff',
  '#7c3aed': '#fff',
  '#b45309': '#fff',
  '#047857': '#fff',
  '#0e7490': '#fff',
  '#be123c': '#fff',
  '#9a3412': '#fff',
  '#374151': '#fff',
}

function textColorFor(bg: string) {
  return CATEGORY_TEXT_COLORS[bg] || '#fff'
}

export default function StandartlarPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSlug, setActiveSlug] = useState<string>('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [pdfModal, setPdfModal] = useState<{ url: string; title: string; type: string } | null>(null)
  const [imageModal, setImageModal] = useState<{ images: StandardImage[]; idx: number } | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    fetch('/api/standartlar')
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data)
        if (data.length > 0) setActiveSlug(data[0].slug)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPdfModal(null)
        setImageModal(null)
      }
      if (imageModal) {
        if (e.key === 'ArrowRight') setImageModal((m) => m ? { ...m, idx: Math.min(m.idx + 1, m.images.length - 1) } : m)
        if (e.key === 'ArrowLeft') setImageModal((m) => m ? { ...m, idx: Math.max(m.idx - 1, 0) } : m)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [imageModal])

  const activeCategory = categories.find((c) => c.slug === activeSlug)

  const filteredStandards = (activeCategory?.standards || []).filter((s) => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || (s.subtitle || '').toLowerCase().includes(q)
    const matchFilter =
      filter === 'all' ||
      (filter === 'breed' && !!s.breedPdfUrl) ||
      (filter === 'colour' && !!s.colourPdfUrl) ||
      (filter === 'recent' && !!(s.breedDate || s.colourDate))
    return matchSearch && matchFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500">
        Henüz standart bulunmamaktadır.
      </div>
    )
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Irk Standartları</h1>
          <p className="text-sm text-gray-500 mt-1">
            Türkiye Süs Hayvanları Federasyonu resmi ırk ve renk standartları
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search + filter */}
        <div className="flex flex-wrap gap-3 items-center mb-5">
          <input
            type="text"
            placeholder="Irk ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {(['all', 'breed', 'colour', 'recent'] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Tümü' : f === 'breed' ? 'Irk Standardı' : f === 'colour' ? 'Renk Standardı' : 'Son Eklenenler'}
            </button>
          ))}
        </div>

        {/* Book layout */}
        <div className="flex rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white min-h-[500px]">
          {/* Content pane */}
          <div className="flex-1 overflow-x-auto">
            {/* Category header */}
            {activeCategory && (
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ backgroundColor: activeCategory.color }}
              >
                <span className="text-white font-semibold text-sm">{activeCategory.fullTitle}</span>
                <span className="ml-auto text-white/70 text-xs">{filteredStandards.length} kayıt</span>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Irk Adı</th>
                    <th className="text-center px-2 py-2.5 font-medium w-[110px]">Irk Std.</th>
                    <th className="text-center px-2 py-2.5 font-medium w-[110px]">Renk Std.</th>
                    <th className="text-center px-2 py-2.5 font-medium w-[90px] hidden sm:table-cell">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStandards.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-400">
                        Sonuç bulunamadı
                      </td>
                    </tr>
                  ) : (
                    filteredStandards.map((s, i) => (
                      <tr
                        key={s.id}
                        className={`border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${
                          i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        } ${s.isDraft ? 'opacity-60' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Thumbnail */}
                            {s.images.length > 0 && (
                              <button
                                onClick={() => setImageModal({ images: s.images, idx: 0 })}
                                className="shrink-0"
                                title="Resimleri görüntüle"
                              >
                                <img
                                  src={s.images[0].url}
                                  alt={s.name}
                                  className="w-8 h-8 rounded object-cover border border-gray-200 hover:border-emerald-400 transition-colors"
                                />
                              </button>
                            )}
                            <div>
                              <span className="font-medium text-gray-800">{s.name}</span>
                              {s.subtitle && (
                                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">
                                  {s.subtitle}
                                </span>
                              )}
                              {s.isDraft && (
                                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                                  Taslak
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          {s.breedPdfUrl ? (
                            <button
                              onClick={() => setPdfModal({ url: s.breedPdfUrl!, title: s.name, type: 'Irk Standardı' })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                              </svg>
                              Irk PDF
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          {s.colourPdfUrl ? (
                            <button
                              onClick={() => setPdfModal({ url: s.colourPdfUrl!, title: s.name, type: 'Renk Standardı' })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                              </svg>
                              Renk PDF
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-center text-xs text-gray-400 hidden sm:table-cell">
                          {s.breedDate || s.colourDate || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tab strip (right side) */}
          <div className="flex flex-col" style={{ width: 44 }}>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => { setActiveSlug(cat.slug); setSearch(''); setFilter('all') }}
                title={cat.fullTitle}
                className="flex-1 flex items-center justify-center transition-all relative"
                style={{
                  backgroundColor: cat.slug === activeSlug ? cat.color : `${cat.color}22`,
                  borderLeft: cat.slug === activeSlug ? `3px solid ${cat.color}` : '3px solid transparent',
                  minHeight: 48,
                }}
              >
                <span
                  className="text-[10px] font-semibold tracking-wider select-none"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    color: cat.slug === activeSlug ? textColorFor(cat.color) : cat.color,
                    whiteSpace: 'nowrap',
                    maxHeight: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      {pdfModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setPdfModal(null) }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <div className="font-semibold text-gray-800 text-sm">{pdfModal.title}</div>
                <div className="text-xs text-gray-400">{pdfModal.type}</div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfModal.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  İndir
                </a>
                <button
                  onClick={() => setPdfModal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <iframe
                ref={iframeRef}
                src={pdfModal.url}
                className="w-full h-full border-0"
                title={pdfModal.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setImageModal(null) }}
        >
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setImageModal(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>
            <img
              src={imageModal.images[imageModal.idx].url}
              alt={imageModal.images[imageModal.idx].caption || ''}
              className="w-full rounded-lg object-contain max-h-[80vh]"
            />
            {imageModal.images[imageModal.idx].caption && (
              <p className="text-center text-white/70 text-sm mt-2">{imageModal.images[imageModal.idx].caption}</p>
            )}
            {imageModal.images.length > 1 && (
              <div className="flex justify-center gap-3 mt-3">
                <button
                  onClick={() => setImageModal((m) => m ? { ...m, idx: Math.max(m.idx - 1, 0) } : m)}
                  disabled={imageModal.idx === 0}
                  className="px-4 py-1.5 bg-white/20 text-white rounded disabled:opacity-30 hover:bg-white/30 text-sm"
                >
                  ‹
                </button>
                <span className="text-white/60 text-sm self-center">{imageModal.idx + 1} / {imageModal.images.length}</span>
                <button
                  onClick={() => setImageModal((m) => m ? { ...m, idx: Math.min(m.idx + 1, m.images.length - 1) } : m)}
                  disabled={imageModal.idx === imageModal.images.length - 1}
                  className="px-4 py-1.5 bg-white/20 text-white rounded disabled:opacity-30 hover:bg-white/30 text-sm"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
