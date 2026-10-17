/**
 * Microsoft Clarity for heatmaps and session recordings.
 * Project ID: x5wv0z61ij
 *
 * Rendered from the root layout head so every page carries one tag.
 * The loader does not insert a second clarity.ms script when one is already
 * on the page, and it does not start the tag while a consent banner is still
 * waiting for a choice. Before the tag loads, every form, input, textarea,
 * and select is marked data-clarity-mask="True", including fields rendered
 * by the shared estimator. Clarity treats the attribute as present for any
 * value, and the project standard is the capital-T value "True".
 * Text inputs are masked from that attribute. Checkbox, radio, range, and
 * button inputs inherit masking from an ancestor, so those get the attribute
 * on the nearest parent when no ancestor is already masked.
 * The same pass masks the estimator thread (echoed answers, the project
 * name taken from what was typed, and the email confirmation), plus address
 * suggestion lists that sit outside that thread. The shared estimator files
 * stay unchanged.
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
  function mark(el){
    if(!el||!el.setAttribute)return;
    if(el.getAttribute("data-clarity-mask")!=="True")el.setAttribute("data-clarity-mask","True");
  }
  function ancestorMasked(el){
    var p=el&&el.parentElement;
    while(p){
      if(p.getAttribute&&p.getAttribute("data-clarity-mask")==="True")return true;
      p=p.parentElement;
    }
    return false;
  }
  function maskOne(el){
    if(!el||!el.tagName)return;
    mark(el);
    var type=(el.getAttribute("type")||"").toLowerCase();
    var inherits=el.tagName==="INPUT"&&(type==="checkbox"||type==="radio"||type==="range"||type==="button"||type==="reset"||type==="submit");
    var parent=el.parentElement;
    if(inherits&&parent&&!ancestorMasked(el)&&parent!==l.body&&parent!==l.documentElement)mark(parent);
  }
  function echoTarget(el){
    if(!el||!el.getAttribute)return false;
    var role=el.getAttribute("data-role");
    var label=el.getAttribute("aria-label");
    var testid=el.getAttribute("data-testid");
    if(role==="user"||label==="Address suggestions"||label==="Project overview"||testid==="address-suggestions"||testid==="p5-wait-choice"||el.getAttribute("data-p5-thread")!==null)return true;
    if(el.tagName!=="DD")return false;
    var parent=el.parentElement;
    while(parent){
      if(parent.getAttribute&&parent.getAttribute("data-p5-thread")!==null)return true;
      parent=parent.parentElement;
    }
    return false;
  }
  function maskEchoes(root){
    if(!root||!root.querySelectorAll)return;
    if(echoTarget(root))mark(root);
    var nodes=root.querySelectorAll('[data-p5-thread],[data-role="user"],[aria-label="Address suggestions"],[data-testid="address-suggestions"],[data-testid="p5-wait-choice"],[aria-label="Project overview"],[data-p5-thread] dd,[data-p5-thread] [data-state]');
    for(var n=0;n<nodes.length;n++)mark(nodes[n]);
  }
  function maskForms(root){
    if(!root||!root.querySelectorAll)return;
    var tag=root.tagName;
    if(tag==="FORM"||tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT")maskOne(root);
    var fields=root.querySelectorAll("form,input,textarea,select");
    for(var n=0;n<fields.length;n++)maskOne(fields[n]);
    maskEchoes(root);
  }
  var watching=false;
  function watchForms(){
    maskForms(l);
    if(watching||typeof MutationObserver!=="function"||!l.body)return;
    watching=true;
    new MutationObserver(function(records){
      for(var i=0;i<records.length;i++){
        var rec=records[i];
        if(rec.type==="attributes"){maskForms(rec.target);continue;}
        var added=rec.addedNodes||[];
        for(var j=0;j<added.length;j++)maskForms(added[j]);
      }
    }).observe(l.body,{childList:true,subtree:true,attributes:true,attributeFilter:["data-clarity-mask"]});
  }
  function load(){
    watchForms();
    if(tagPresent()||consentPending())return;
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];
    if(y&&y.parentNode)y.parentNode.insertBefore(t,y);
    else l.head.appendChild(t);
  }
  function start(){watchForms();load();}
  if(l.readyState==="complete")start();
  else c.addEventListener("load",start);
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
