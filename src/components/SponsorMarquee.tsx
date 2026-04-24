'use client'

import { useState } from 'react'

interface Sponsor {
  id: number
  name: string
  logoUrl: string | null
  websiteUrl: string | null
}

interface Props {
  sponsors: Sponsor[]
}

export default function SponsorMarquee({ sponsors }: Props) {
  const [paused, setPaused] = useState(false)

  if (sponsors.length === 0) return null

  // Seamless sonsuz döngü için listeyi 3 kez tekrarla
  const items = [...sponsors, ...sponsors, ...sponsors]

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Sol ve sağ soluk geçiş */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-gray-800 to-transparent pointer-events-none" />

      <div
        className="flex gap-5 items-center"
        style={{
          animation: `marquee ${sponsors.length * 3}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
          width: 'max-content',
        }}
      >
        {items.map((s, i) => {
          const card = (
            <div
              className="flex-shrink-0 bg-white/8 hover:bg-white/15 border border-white/10 hover:border-amber-400/50 rounded-2xl transition-all duration-300 flex items-center justify-center overflow-hidden"
              style={{ width: 220, height: 140 }}
            >
              {s.logoUrl ? (
                <img
                  src={s.logoUrl}
                  alt={s.name}
                  className="w-full h-full object-contain p-4 filter brightness-90 hover:brightness-110 transition-all"
                />
              ) : (
                <span className="text-white font-semibold text-sm text-center px-3 leading-snug">
                  {s.name}
                </span>
              )}
            </div>
          )

          return s.websiteUrl ? (
            <a key={`${s.id}-${i}`} href={s.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
              {card}
            </a>
          ) : (
            <div key={`${s.id}-${i}`} className="flex-shrink-0">
              {card}
            </div>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
