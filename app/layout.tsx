import type { Metadata, Viewport } from 'next'
import { Montserrat, Fraunces } from 'next/font/google'
import { GoogleAnalytics } from '@/components/seo/GoogleAnalytics'
import { Navigation } from '@/components/Navigation'
import { ConditionalFooter } from '@/components/ConditionalFooter'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/Providers'
import { ScrollToTop } from '@/components/ScrollToTop'
import { HOMEPAGE_DESCRIPTION, HOMEPAGE_TITLE } from '@/lib/seo'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
})

const fraunces = Fraunces({
  // Only 300 (display numerals, .brc-display-num) and 400 italic (.brc-accent /
  // pull-quotes) are used in the design system, so weight 500 is intentionally
  // dropped to cut two font files from the critical download.
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
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
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
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
    images: [{ url: '/images/marketing/og-default.webp', width: 1792, height: 1024, alt: 'Boise Cabinet Co custom kitchen cabinets' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    images: ['/images/marketing/og-default.webp'],
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
  themeColor: '#3A3E3D',
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
    <html lang="en" className={`${montserrat.variable} ${fraunces.variable}`} suppressHydrationWarning>
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
        <GoogleAnalytics />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <noscript>
          <style>{`.reveal-init{opacity:1!important;transform:none!important}`}</style>
        </noscript>
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
