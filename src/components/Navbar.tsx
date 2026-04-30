'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavChild {
  label: string
  href: string
  divider?: boolean
  newTab?: boolean
}

interface NavItem {
  id: number
  label: string
  href: string
  active: boolean
  newTab?: boolean
  children?: NavChild[]
}

// Üye Girişi her zaman sabit kalır
const UYE_ITEM: NavItem = {
  id: 999,
  label: 'Giriş',
  href: '/uye-girisi',
  active: true,
  children: [
    { label: '👤 Üye Girişi', href: '/uye-girisi' },
    { label: '📝 Üye Ol', href: '/uye-ol' },
    { label: '🖥️ Üye Paneli', href: '/uye/dashboard' },
    { divider: true, label: '', href: '' },
    { label: '⚖️ Hakem Girişi', href: '/hakem/giris' },
    { label: '🏛 Dernek Başkanı Girişi', href: '/baskan/giris' },
  ],
}

export default function Navbar() {
  const [dbItems, setDbItems] = useState<NavItem[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/nav-menu')
      .then(r => r.json())
      .then(data => setDbItems(data))
      .catch(() => {})
  }, [])

  const navItems = [...dbItems.filter(i => i.active), UYE_ITEM]

  const closeMobile = () => {
    setMobileOpen(false)
    setMobileOpenDropdown(null)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Üst şerit */}
      <div className="bg-primary-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <span className="hidden sm:block truncate">Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu</span>
          <span className="sm:hidden font-semibold tracking-wide">TSHF</span>
          <span className="text-primary-400 text-xs">tshf@tshf.org.tr</span>
        </div>
      </div>

      {/* Logo & Nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-28">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" onClick={closeMobile}>
            <img
              src="/tshf-logo.png"
              alt="TSHF Logo"
              className="h-20 md:h-24 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => item.children && item.children.length > 0 && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.children && item.children.length > 0 ? (
                  <>
                    <button
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                        pathname.startsWith(item.href) && item.href !== '#'
                          ? 'text-primary-700 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    >
                      {item.label}
                      <svg className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl py-1.5 min-w-[220px] border border-gray-100 z-50">
                        {item.children.map((child, ci) => (
                          child.divider ? (
                            <div key={ci} className="mx-3 my-1 border-t border-gray-100" />
                          ) : (
                            <Link
                              key={ci}
                              href={child.href}
                              target={child.newTab ? '_blank' : undefined}
                              rel={child.newTab ? 'noopener noreferrer' : undefined}
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {child.label}
                            </Link>
                          )
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    target={item.newTab ? '_blank' : undefined}
                    rel={item.newTab ? 'noopener noreferrer' : undefined}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors block whitespace-nowrap ${
                      pathname === item.href
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menü"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white max-h-[75vh] overflow-y-auto">
          <div className="px-3 py-2 space-y-0.5">
            {navItems.map((item) => (
              <div key={item.id}>
                {item.children && item.children.length > 0 ? (
                  <>
                    <button
                      className="w-full flex items-center justify-between py-3 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setMobileOpenDropdown(mobileOpenDropdown === item.label ? null : item.label)}
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${mobileOpenDropdown === item.label ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {mobileOpenDropdown === item.label && (
                      <div className="ml-3 pl-3 border-l-2 border-primary-100 space-y-0.5 mb-1">
                        {item.children.map((child, ci) => (
                          child.divider ? (
                            <div key={ci} className="my-1 border-t border-gray-100" />
                          ) : (
                            <Link
                              key={ci}
                              href={child.href}
                              target={child.newTab ? '_blank' : undefined}
                              rel={child.newTab ? 'noopener noreferrer' : undefined}
                              className="block py-2.5 px-3 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              onClick={closeMobile}
                            >
                              {child.label}
                            </Link>
                          )
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    target={item.newTab ? '_blank' : undefined}
                    rel={item.newTab ? 'noopener noreferrer' : undefined}
                    className={`block py-3 px-3 text-sm font-medium rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={closeMobile}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
          {/* Mobil alt kısım */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex gap-2 flex-wrap">
            <Link href="/uye-girisi" onClick={closeMobile}
              className="flex-1 text-center text-sm font-medium text-primary-700 border border-primary-300 rounded-lg py-2.5 hover:bg-primary-50 transition-colors">
              👤 Üye Girişi
            </Link>
            <Link href="/uye-ol" onClick={closeMobile}
              className="flex-1 text-center text-sm font-medium text-white bg-primary-600 rounded-lg py-2.5 hover:bg-primary-700 transition-colors">
              Üye Ol
            </Link>
            <Link href="/hakem/giris" onClick={closeMobile}
              className="flex-1 text-center text-sm font-medium text-amber-800 border border-amber-200 bg-amber-50 rounded-lg py-2.5 hover:bg-amber-100 transition-colors">
              ⚖️ Hakem
            </Link>
            <Link href="/baskan/giris" onClick={closeMobile}
              className="w-full text-center text-sm font-medium text-primary-800 border border-primary-200 bg-primary-50 rounded-lg py-2.5 hover:bg-primary-100 transition-colors">
              🏛 Dernek Başkanı Girişi
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
