import type { Metadata, Viewport } from 'next'
import { Montserrat, Fraunces } from 'next/font/google'
import { Navigation } from '@/components/Navigation'
import { ConditionalFooter } from '@/components/ConditionalFooter'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/Providers'
import { ScrollToTop } from '@/components/ScrollToTop'
import { SITE_TAGLINE } from '@/shared/siteContent'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Boise Cabinet Co | Custom Cabinets Idaho',
    template: '%s | Boise Cabinet Co',
  },
  description: `Custom kitchen, bathroom, and storage cabinets serving Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell. ${SITE_TAGLINE}. Design your cabinets online or schedule a free consultation.`,
  manifest: '/site.webmanifest',
  authors: [{ name: 'Boise Cabinet Co' }],
  creator: 'Boise Cabinet Co',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://boisecabinet.co'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Boise Cabinet Co',
    title: 'Boise Cabinet Co | Custom Cabinets Idaho',
    description: `${SITE_TAGLINE}. Premium custom cabinetry across the Treasure Valley.`,
    images: [{ url: '/images/marketing/og-default.webp', width: 1792, height: 1024, alt: 'Boise Cabinet Co custom kitchen cabinets' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boise Cabinet Co | Custom Cabinets Idaho',
    description: `${SITE_TAGLINE}. Idaho's premier custom cabinet company.`,
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/marketing/hero-home.webp"
          fetchPriority="high"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <noscript>
          <style>{`.reveal-init{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <Providers>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
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
