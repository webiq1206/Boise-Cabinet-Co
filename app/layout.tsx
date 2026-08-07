import type { Metadata, Viewport } from 'next'
import { Montserrat, Libre_Baskerville } from 'next/font/google'
import { GoogleAnalytics } from '@/components/seo/GoogleAnalytics'
import { MicrosoftClarity } from '@/components/seo/MicrosoftClarity'
import { MetaPixel } from '@/components/seo/MetaPixel'
import { AnalyticsBridge } from '@/components/seo/AnalyticsBridge'
import { Navigation } from '@/components/Navigation'
import { ConditionalFooter } from '@/components/ConditionalFooter'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/Providers'
import { ScrollToTop } from '@/components/ScrollToTop'
import { HOMEPAGE_DESCRIPTION, HOMEPAGE_TITLE } from '@/lib/seo'
import './globals.css'

const montserrat = Montserrat({
  // The dark brand system caps all text at weight 400 (nothing bold), so only
  // Light (300, headings) and Regular (400, body/labels) are loaded - dropping
  // 500/600 cuts two font files from the critical download.
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-montserrat',
  display: 'swap',
})

const libreBaskerville = Libre_Baskerville({
  // The brand's accent typeface. Regular (400, display numerals via
  // .brc-display-num) and 400 italic (.brc-accent / pull-quotes) are the only
  // cuts used in the design system; Libre Baskerville ships only 400/700, so
  // this loads just the two files the identity actually needs.
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-libre-baskerville',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: HOMEPAGE_TITLE,
    template: '%s | Boise Cabinet Co',
  },
  description: HOMEPAGE_DESCRIPTION,
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
  authors: [{ name: 'Boise Cabinet Co' }],
  creator: 'Boise Cabinet Co',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://boisecabinet.co'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Boise Cabinet Co',
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    images: [{ url: '/images/marketing/og-default.png', width: 1200, height: 630, alt: 'Boise Cabinet Co - custom cabinetry, Treasure Valley, Idaho' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    images: ['/images/marketing/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#1C1F1E',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${montserrat.variable} ${libreBaskerville.variable}`} style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        {/*
          The hero LCP image is preloaded by next/image's `priority` prop in
          HeroSection, which emits a preload whose imagesrcset/imagesizes match
          the custom variant loader's output. A manual <link rel="preload"> for
          the raw .webp would point at a URL the rendered srcset never requests,
          causing a wasted duplicate download, so it is intentionally omitted.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
        {/* Feed autodiscovery: lets crawlers, readers, and AI agents poll for
            new content instead of re-crawling the whole site. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Boise Cabinet Co | Cabinet guides and insights"
          href="https://boisecabinet.co/feed.xml"
        />
        <GoogleAnalytics />
        <MicrosoftClarity />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <noscript>
          <style>{`.reveal-init{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {/* In <body>: the pixel's <noscript> fallback img is invalid inside <head>.
            next/script (afterInteractive) injects the tag regardless of placement. */}
        <MetaPixel />
        <AnalyticsBridge />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sm focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Providers>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <ConditionalFooter />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
