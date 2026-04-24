import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu',
    template: '%s | TSHF',
  },
  description: 'Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu resmi web sitesi',
  keywords: ['süs tavuğu', 'bahçe hayvanları', 'federasyon', 'tavukçuluk'],
  icons: {
    icon: '/tshf-logo.png',
    shortcut: '/tshf-logo.png',
    apple: '/tshf-logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2420182734822651"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
