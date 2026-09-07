import Script from 'next/script'

/**
 * GA4 via gtag.js. Measurement ID can be overridden per environment with
 * NEXT_PUBLIC_GA_MEASUREMENT_ID; the fallback is the production property.
 * Loaded afterInteractive so it never blocks LCP.
 */
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-7VW3996ZLD'
const GOOGLE_ADS_DESTINATION_ID = 'AW-18354188204'

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null
  // Keep dev / preview traffic out of the production GA property.
  if (process.env.NODE_ENV !== 'production') return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
          gtag('config', '${GOOGLE_ADS_DESTINATION_ID}');
        `}
      </Script>
    </>
  )
}
