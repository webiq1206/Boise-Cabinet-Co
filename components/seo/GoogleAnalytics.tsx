import { googleTagBootstrap } from '@/lib/analyticsBootstrap';
import Script from 'next/script'

/**
 * GA4 via gtag.js. Measurement ID can be overridden per environment with
 * NEXT_PUBLIC_GA_MEASUREMENT_ID; the fallback is the production property.
 * Loaded afterInteractive so it never blocks LCP.
 */
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-7VW3996ZLD'

/** Load only for real visitors on this brand's live hostname. */
export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== 'production' || !GA_MEASUREMENT_ID) return null;
  return (
    <Script id="ga-init" strategy="afterInteractive">
      {googleTagBootstrap({
        hostname: 'boisecabinet.co',
        measurementId: GA_MEASUREMENT_ID,
        adsId: 'AW-18354188204',
        phoneConversionLabel: 'YHR0CIaPz_ccEKzf-q9E',
        phoneNumber: '(208) 477-1169',
      })}
    </Script>
  );
}
