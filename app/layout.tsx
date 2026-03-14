import type { Metadata } from 'next'
import Script from 'next/script'
import { Montserrat, Playfair_Display } from 'next/font/google'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/Providers'
import { ScrollToTop } from '@/components/ScrollToTop'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Lawn Care Kuna - Professional Landscaping Services in Idaho',
    template: '%s | Lawn Care Kuna',
  },
  description: 'Professional lawn care and landscaping services in Kuna, Boise, Meridian, Eagle, Star, and Middleton, Idaho. Get a free quote today!',
  authors: [{ name: 'Lawn Care Kuna' }],
  creator: 'Lawn Care Kuna',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lawncarekuna.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Lawn Care Kuna',
    title: 'Lawn Care Kuna - Professional Landscaping Services',
    description: 'Professional lawn care and landscaping services in the Treasure Valley, Idaho.',
    images: [
      {
        url: '/images/lawn-care-kuna-logo.png',
        width: 1200,
        height: 630,
        alt: 'Lawn Care Kuna - Professional Lawn Care and Landscaping Services in Kuna Idaho',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lawn Care Kuna - Professional Landscaping Services',
    description: 'Professional lawn care and landscaping services in the Treasure Valley, Idaho.',
    images: ['/images/lawn-care-kuna-logo.png'],
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
    apple: '/apple-touch-icon.png',
  },
}

// Organization JSON-LD Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Lawn Care Kuna",
  "description": "Professional lawn care and landscaping services in Kuna, Boise, Meridian, Eagle, Star, and Middleton, Idaho.",
  "url": "https://lawncarekuna.com",
  "logo": "https://lawncarekuna.com/images/lawn-care-kuna-logo.png",
  "telephone": "(208) 352-2011",
  "email": "hello@lawncarekuna.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2283 N Coopers Hawk Ave",
    "addressLocality": "Kuna",
    "addressRegion": "ID",
    "postalCode": "83634",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "43.4918",
    "longitude": "-116.4198"
  },
  "areaServed": [
    { "@type": "City", "name": "Kuna" },
    { "@type": "City", "name": "Boise" },
    { "@type": "City", "name": "Meridian" },
    { "@type": "City", "name": "Eagle" },
    { "@type": "City", "name": "Star" },
    { "@type": "City", "name": "Middleton" }
  ],
  "priceRange": "$$",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "07:00",
    "closes": "19:00"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "247",
    "bestRating": "5",
    "worstRating": "1"
  },
  "sameAs": [
    "https://www.facebook.com/lawncarekuna",
    "https://www.instagram.com/lawncarekuna"
  ]
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-1HD7RT8PKJ';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <head>
        <link
          rel="preload"
          href="/images/hero-background.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
        </Script>
      </body>
    </html>
  )
}
