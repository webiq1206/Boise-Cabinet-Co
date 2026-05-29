import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/Providers'
import { ScrollToTop } from '@/components/ScrollToTop'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
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
    default: 'Boise Remodeling Co — A More Honest Way to Remodel',
    template: '%s | Boise Remodeling Co',
  },
  description: 'Design-build remodeling serving Boise, Meridian, Eagle, Nampa, Kuna, Star & Middleton. Transparent pricing, 3D renders, and a dedicated project manager from first call to final walkthrough. Book a free in-home consultation.',
  authors: [{ name: 'Boise Remodeling Co' }],
  creator: 'Boise Remodeling Co',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://boiseremodeling.co'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Boise Remodeling Co',
    title: 'Boise Remodeling Co — A More Honest Way to Remodel',
    description: 'Transparent design-build remodeling for kitchens, bathrooms, whole-home renovations, and additions in the Treasure Valley.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boise Remodeling Co — A More Honest Way to Remodel',
    description: 'Transparent design-build remodeling for Boise and the Treasure Valley.',
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
  icons: {
    icon: '/favicon.png',
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
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
