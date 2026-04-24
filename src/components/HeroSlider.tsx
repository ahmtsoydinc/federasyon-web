'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

interface Slide {
  id: number
  title: string
  subtitle: string | null
  imageUrl: string
  videoUrl: string | null
  linkUrl: string | null
  linkLabel: string | null
}

interface Props {
  slides: Slide[]
  interval?: number
}

export default function HeroSlider({ slides, interval = 5000 }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % slides.length)
    setProgress(0)
    startTimeRef.current = Date.now()
  }, [slides.length])

  const prev = () => {
    setCurrent(c => (c - 1 + slides.length) % slides.length)
    setProgress(0)
    startTimeRef.current = Date.now()
  }

  const goTo = (i: number) => {
    setCurrent(i)
    setProgress(0)
    startTimeRef.current = Date.now()
  }

  // Otomatik geçiş (sadece resim slide'larda)
  useEffect(() => {
    const slide = slides[current]
    if (paused || slides.length <= 1 || slide?.videoUrl) return
    const t = setInterval(next, interval)
    return () => clearInterval(t)
  }, [paused, next, slides, current, interval])

  // İlerleme çubuğu (sadece resim slide'larda)
  useEffect(() => {
    const slide = slides[current]
    if (paused || slides.length <= 1 || slide?.videoUrl) {
      if (progressRef.current) clearInterval(progressRef.current)
      if (slide?.videoUrl) setProgress(0)
      return
    }
    setProgress(0)
    startTimeRef.current = Date.now()
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      setProgress(Math.min((elapsed / interval) * 100, 100))
    }, 50)
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [current, paused, slides, interval])

  if (slides.length === 0) return null

  const slide = slides[current]

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ height: 'clamp(240px, 56vw, 660px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {s.videoUrl ? (
            /* key=current video'yu aktif slayt değişince sıfırdan mount eder → autoPlay çalışır */
            i === current ? (
              <video
                key={`video-${s.id}-${current}`}
                src={s.videoUrl}
                className="absolute inset-0 w-full h-full object-contain"
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={next}
              />
            ) : (
              /* Pasif slayt: sadece boş siyah alan, video yok */
              <div className="absolute inset-0 bg-black" />
            )
          ) : (
            <img
              src={s.imageUrl}
              alt={s.title}
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* İçerik */}
      <div className="absolute inset-0 z-20 flex items-end sm:items-center pb-10 sm:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full">
          <div className="max-w-2xl">
            <h2
              key={`title-${current}`}
              className="text-xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight mb-2 sm:mb-4 drop-shadow-md"
            >
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p
                key={`sub-${current}`}
                className="hidden sm:block text-sm sm:text-base lg:text-lg text-white/80 mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3"
              >
                {slide.subtitle}
              </p>
            )}
            {slide.linkUrl && (
              <Link
                href={slide.linkUrl}
                className="inline-flex items-center gap-2 bg-gold-500 text-primary-900 font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-gold-400 transition-colors text-xs sm:text-sm lg:text-base shadow-lg"
              >
                {slide.linkLabel || 'Devamını Oku'}
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Ok butonları */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Önceki"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Sonraki"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Alt navigasyon */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className="h-1 bg-white/20">
            <div
              className="h-full bg-gold-400 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 py-3">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'bg-gold-400 w-8 h-2.5' : 'bg-white/40 hover:bg-white/70 w-2.5 h-2.5'
                }`}
                aria-label={`Slayt ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sağ üst: sayaç */}
      {slides.length > 1 && (
        <div className="absolute top-4 right-5 z-30 flex items-center gap-2">
          <span className="text-white/60 text-xs font-medium">{current + 1} / {slides.length}</span>
          {!slide.videoUrl && (
            <button
              onClick={() => setPaused(p => !p)}
              className="bg-black/30 hover:bg-black/50 text-white/70 hover:text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label={paused ? 'Oynat' : 'Duraklat'}
            >
              {paused ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
