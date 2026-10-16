/**
 * Microsoft Clarity for heatmaps and session recordings.
 * Project ID: x5wv0z61ij
 *
 * Rendered from the root layout head so every page carries one tag.
 * The loader does not insert a second clarity.ms script when one is already
 * on the page, and it does not start the tag while a consent banner is still
 * waiting for a choice. Before the tag loads, every form is marked
 * data-clarity-mask="true", including forms rendered by the shared estimator.
 */
const CLARITY_ID = 'x5wv0z61ij'

const CLARITY_SNIPPET = `(function(c,l,a,r,i,t,y){
  function tagPresent(){
    return !!l.querySelector('script[src*="clarity.ms/tag/'+i+'"]');
  }
  function consentPending(){
    var banner=l.querySelector('[data-consent-banner],[data-cookie-consent],[data-cookie-banner],#cookie-banner,#cookie-consent,#onetrust-banner-sdk,#CybotCookiebotDialog');
    if(!banner)return false;
    var state=(banner.getAttribute('data-consent')||banner.getAttribute('data-state')||'').toLowerCase();
    return state!=='granted'&&state!=='accepted'&&state!=='allow';
  }
  function maskForms(root){
    if(!root||!root.querySelectorAll)return;
    if(root.tagName==="FORM")root.setAttribute("data-clarity-mask","true");
    var forms=root.querySelectorAll("form");
    for(var n=0;n<forms.length;n++)forms[n].setAttribute("data-clarity-mask","true");
  }
  var watching=false;
  function watchForms(){
    maskForms(l);
    if(watching||typeof MutationObserver!=="function"||!l.body)return;
    watching=true;
    new MutationObserver(function(records){
      for(var i=0;i<records.length;i++){
        var added=records[i].addedNodes;
        for(var j=0;j<added.length;j++)maskForms(added[j]);
      }
    }).observe(l.body,{childList:true,subtree:true});
  }
  function load(){
    if(tagPresent()||consentPending())return;
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];
    if(y&&y.parentNode)y.parentNode.insertBefore(t,y);
    else l.head.appendChild(t);
  }
  function start(){watchForms();load();}
  if(l.readyState==="loading")l.addEventListener("DOMContentLoaded",start);
  else start();
  c.addEventListener("consentgranted",function(){if(l.readyState!=="loading")load();});
})(window, document, "clarity", "script", "${CLARITY_ID}");`

export function MicrosoftClarity() {
  // Only record real visitors. Local dev and preview traffic would pollute
  // heatmaps and session recordings.
  if (process.env.NODE_ENV !== 'production') return null

  return (
    <script id="ms-clarity" dangerouslySetInnerHTML={{ __html: CLARITY_SNIPPET }} />
  )
}
