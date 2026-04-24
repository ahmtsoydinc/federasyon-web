import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Irk Standartları' }

const TSHF_BASE = 'https://tshfedstandartlar.com'

const standartBranslar = [
  {
    name: 'Yerli Irklar',
    description: 'Denizli, Gerze, Trabzon Gugullusu ve Türk Asil gibi Türkiye\'ye özgü yerli tavuk ırklarının standartları.',
    emoji: '🇹🇷',
    href: `${TSHF_BASE}/Yerli.php`,
    bg: 'from-red-50 to-orange-50',
    iconBg: 'bg-red-100',
  },
  {
    name: 'Cüce Tavukları',
    description: 'Chabo, Serama, İspenç ve diğer cüce tavuk ırklarının ırk ve renk standartları.',
    emoji: '🐤',
    href: `${TSHF_BASE}/Cuce.php`,
    bg: 'from-yellow-50 to-amber-50',
    iconBg: 'bg-yellow-100',
  },
  {
    name: 'Hindiler',
    description: 'Alman Hindisi, Amerikan Bronz Hindisi, Narragansett ve diğer hindi ırklarının standartları.',
    emoji: '🦃',
    href: `${TSHF_BASE}/Hindi.php`,
    bg: 'from-orange-50 to-amber-50',
    iconBg: 'bg-orange-100',
  },
  {
    name: 'Kazlar',
    description: 'Emden, Toulouse, Afrika Kazı ve diğer kaz ırklarının ırk ve renk standartları.',
    emoji: '🪿',
    href: `${TSHF_BASE}/Kaz.php`,
    bg: 'from-green-50 to-emerald-50',
    iconBg: 'bg-green-100',
  },
  {
    name: 'Ördekler',
    description: 'Pekin, Aylesbury, Cayuga, Muscovy ve diğer ördek ırklarının standartları.',
    emoji: '🦆',
    href: `${TSHF_BASE}/Ordek.php`,
    bg: 'from-blue-50 to-cyan-50',
    iconBg: 'bg-blue-100',
  },
]

export default async function BranslarPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Irk Standartları</h1>
      <p className="text-gray-500 mb-8 sm:mb-10">
        Irk ve renk standartları için ilgili bölüme tıklayınız. Standartlar{' '}
        <a href={TSHF_BASE} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">
          tshfedstandartlar.com
        </a>{' '}
        adresinde yayımlanmaktadır.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {standartBranslar.map((b) => (
          <a
            key={b.name}
            href={b.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group bg-gradient-to-br ${b.bg} rounded-2xl border border-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-6 flex flex-col gap-4`}
          >
            {/* İkon */}
            <div className={`w-16 h-16 ${b.iconBg} rounded-2xl flex items-center justify-center text-4xl shadow-sm`}>
              {b.emoji}
            </div>

            {/* İçerik */}
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="font-bold text-gray-800 text-lg group-hover:text-primary-700 transition-colors">
                  {b.name}
                </h2>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
            </div>

            {/* Alt çubuk */}
            <div className="flex items-center gap-2 text-xs text-primary-600 font-medium group-hover:gap-3 transition-all">
              <span>Standartları Gör</span>
              <span>→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
