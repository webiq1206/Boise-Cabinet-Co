/**
 * Inline-script helper that holds a third-party tag back until the visitor
 * interacts with the page (pointerdown, keydown, scroll or touchstart), or
 * until THIRD_PARTY_FALLBACK_MS after the window load event, whichever comes
 * first. Microsoft Clarity waits behind this gate so its parse and execution
 * cost stays out of the first-load main thread. Meta Pixel does not: it loads
 * at the window load event (AT_WINDOW_LOAD below, owner call B).
 *
 * The value is a JavaScript function expression for inline scripts:
 * `(${AFTER_FIRST_INTERACTION})(function () { ...load the tag... })`.
 * The callback runs exactly once.
 */
export const THIRD_PARTY_FALLBACK_MS = 5000;

export const AFTER_FIRST_INTERACTION = `function(run){
  var w=window,d=document,done=false,events=["pointerdown","keydown","scroll","touchstart"],opts={capture:true,passive:true},i;
  function go(){
    if(done)return;
    done=true;
    for(var k=0;k<events.length;k++)w.removeEventListener(events[k],go,opts);
    run();
  }
  for(i=0;i<events.length;i++)w.addEventListener(events[i],go,opts);
  function arm(){w.setTimeout(go,${THIRD_PARTY_FALLBACK_MS});}
  if(d.readyState==="complete")arm();
  else w.addEventListener("load",arm,{once:true});
}`;

/**
 * Inline-script helper that runs a callback once, at the window load event
 * (or straight away when the page has already loaded). No interaction wait
 * and no extra delay.
 *
 * Owner call B (2026-11-01): paid-ad Landing Page View counts matter more than
 * the small blocking-time saving, so the Meta Pixel vendor script (fbevents.js)
 * loads here instead of behind AFTER_FIRST_INTERACTION. A visitor who bounces
 * before interacting is still counted. Clarity stays behind the gate.
 */
export const AT_WINDOW_LOAD = `function(run){
  var w=window,d=document;
  if(d.readyState==="complete")run();
  else w.addEventListener("load",function(){run();},{once:true});
}`;
