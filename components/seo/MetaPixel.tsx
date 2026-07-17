"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Meta (Facebook) conversion pixel.
 *
 * Dataset "Boise Cabinet Co" (P5 Home Co business), created in Events Manager
 * and connected to ad account 956415147420695. Kept separate from the sister
 * site's "Boise Remodeling Co" pixel so attribution and audiences stay clean.
 *
 * The ID is public (it ships in the page source), so it is defaulted here the
 * same way the Clarity project ID is. NEXT_PUBLIC_META_PIXEL_ID overrides it.
 *
 * Two details the copy-paste Meta snippet gets wrong on a Next.js app-router
 * site, handled here:
 *  1. Client-side navigation does not reload the page, so the base snippet's
 *     single PageView would undercount. We fire PageView on each route change.
 *  2. A <noscript> pixel is included for visitors without JS.
 *
 * Standard events (e.g. Lead) are fired via lib/analytics/metaPixel.ts.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "899086193239991";

export function MetaPixel() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!PIXEL_ID) return;
    // The base snippet already fires PageView on first load; only track the
    // client-side navigations after it.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") fbq("track", "PageView");
  }, [pathname]);

  // Never load on dev/preview traffic, and no-op until the pixel ID is set.
  if (!PIXEL_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
