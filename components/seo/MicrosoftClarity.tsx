import Script from 'next/script'

/**
 * Microsoft Clarity for heatmaps and session recordings.
 * Project ID: x5wv0z61ij
 * Loaded afterInteractive so it never blocks LCP.
 */
const CLARITY_ID = 'x5wv0z61ij'

export function MicrosoftClarity() {
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `}
    </Script>
  )
}
