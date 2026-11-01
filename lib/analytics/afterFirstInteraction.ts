/**
 * Inline-script helper that holds a third-party tag back until the visitor
 * interacts with the page (pointerdown, keydown, scroll or touchstart), or
 * until THIRD_PARTY_FALLBACK_MS after the window load event, whichever comes
 * first. Google's gtag is the only third-party script allowed before
 * interaction; Meta Pixel and Microsoft Clarity wait behind this gate so
 * their parse and execution cost stays out of the first-load main thread.
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
