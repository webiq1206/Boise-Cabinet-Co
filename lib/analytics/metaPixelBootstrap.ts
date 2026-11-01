import { AT_WINDOW_LOAD } from "./afterFirstInteraction";

/**
 * Meta's base snippet, split in two. The fbq stub (with its queue), init and
 * the first PageView are set up straight after hydration, so route-change
 * PageViews and Lead events fired through lib/analytics/metaPixel.ts are
 * queued from the start. fbevents.js itself is fetched at the window load
 * event, with no interaction wait (owner call B, 2026-11-01: Landing Page View
 * accuracy for paid ads outweighs the small blocking-time saving); on arrival
 * it flushes the queue in order. Clarity still waits for interaction.
 */
export function buildPixelBootstrap(pixelId: string): string {
  return `(function(f,b){
  if(f.fbq)return;
  var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
  n('init',${JSON.stringify(pixelId)});
  n('track','PageView');
  (${AT_WINDOW_LOAD})(function(){
    var t=b.createElement('script');t.async=!0;t.src='https://connect.facebook.net/en_US/fbevents.js';
    var s=b.getElementsByTagName('script')[0];
    if(s&&s.parentNode)s.parentNode.insertBefore(t,s);else b.head.appendChild(t);
  });
})(window,document);`;
}
