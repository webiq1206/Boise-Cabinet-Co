import { AFTER_FIRST_INTERACTION } from "./afterFirstInteraction";

/**
 * Meta's base snippet, split in two. The fbq stub (with its queue), init and
 * the first PageView are set up straight after hydration, so route-change
 * PageViews and Lead events fired through lib/analytics/metaPixel.ts are
 * queued from the start. fbevents.js itself is only fetched after the first
 * interaction or 5 seconds after load (owner rule: no third-party script
 * before interaction except gtag); on arrival it flushes the queue in order.
 */
export function buildPixelBootstrap(pixelId: string): string {
  return `(function(f,b){
  if(f.fbq)return;
  var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
  n('init',${JSON.stringify(pixelId)});
  n('track','PageView');
  (${AFTER_FIRST_INTERACTION})(function(){
    var t=b.createElement('script');t.async=!0;t.src='https://connect.facebook.net/en_US/fbevents.js';
    var s=b.getElementsByTagName('script')[0];
    if(s&&s.parentNode)s.parentNode.insertBefore(t,s);else b.head.appendChild(t);
  });
})(window,document);`;
}
