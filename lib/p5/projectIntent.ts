import type {ScopeAnswers,ScopeExtraction} from './scope';
import {retainTypedAlternatives} from './typedAlternatives.ts';
type CabinetIntentDecision={service?:'cabinet-install'|'cabinet-product';suppressCabinetService:boolean};
const CABINET_VALUE=new Set(['cabinet-install','cabinet-product']);
function cabinetIntentDecision(text:string,services:readonly string[]):CabinetIntentDecision{
  if(services.some(service=>!['cabinet-install','cabinet-product','change-order','rush'].includes(service)))return {suppressCabinetService:false};
  if(!services.includes('cabinet-install')||!services.includes('cabinet-product')||!/\b(?:cabinets?|vanit(?:y|ies))\b/i.test(text))return {suppressCabinetService:false};
  const cabinetScope=text.replace(/\b(?:cabinets?|vanit(?:y|ies))\s+(?:purchase|supply|products?|materials?|painting|refinishing)\b/gi,'product responsibility');
  const cabinetsExcluded=/\b(?:exclude|excluding|omit|omitting|without|no|do\s+not\s+include|don't\s+include)\s+(?:any\s+|the\s+)?(?:cabinets?|vanit(?:y|ies))\b|\b(?:cabinets?|vanit(?:y|ies))\b[^.!?;\n]{0,40}\b(?:are\s+)?(?:excluded|omitted|not\s+included)\b/i.test(cabinetScope);
  const positive=text.replace(/\b(?:do\s+not|don't|without|no|exclude|excluding)\s+(?:the\s+)?install(?:ation|ing)?\b/gi,'');
  const directInstall=/\binstall(?:ing)?\b[^.!?;\n]{0,160}\b(?:cabinets?|vanit(?:y|ies))\b|\b(?:installation\s+of|(?:cabinets?|vanit(?:y|ies))\s+installation)\b/i.test(positive);
  const uncertainInstall=directInstall&&/\b(?:maybe|possibly|potentially|might|may|could|considering|undecided|unsure|not\s+sure)\b/i.test(positive);
  if(cabinetsExcluded||uncertainInstall)return {suppressCabinetService:true};
  const without=/\b(?:exclude|excluding|without|no)\s+(?:the\s+)?install(?:ation|ing)?\b|\bsupply\s+only\b|\bdo\s+not\s+install\b/i.test(text);
  const ownerSupplied=/\b(?:owner|customer|client)[ -]?(?:supplied|provided|purchased)\b[^.!?\n]{0,120}\b(?:cabinets?|vanit(?:y|ies))\b|\b(?:cabinets?|vanit(?:y|ies))\b[^.!?\n]{0,120}\b(?:owner|customer|client)[ -]?(?:supplied|provided|purchased)\b/i.test(text);
  const laborOnly=/\blabor[ -]only\b/i.test(text);
  const withInstall=/\b(?:supply|supplying)\s+and\s+install(?:ing|ation)?\b|\binclude\s+(?:the\s+)?installation\b|\bcabinets?\s+with\s+installation\b/i.test(text)||directInstall||laborOnly&&ownerSupplied;
  if(without===withInstall)return {suppressCabinetService:false};
  return {service:withInstall?'cabinet-install':'cabinet-product',suppressCabinetService:false};
}
/** An explicit current request wins over the Cabinet page's historical supply-only default. */
export function cabinetIntent(text:string,services:readonly string[]):'cabinet-install'|'cabinet-product'|undefined{
  return cabinetIntentDecision(text,services).service;
}
export function applyCabinetIntent(text:string,services:readonly string[],answers:ScopeAnswers,extraction?:ScopeExtraction){
  if(extraction)extraction=retainTypedAlternatives(text,extraction);
  const {service,suppressCabinetService}=cabinetIntentDecision(text,services);
  if(suppressCabinetService){
    const nextAnswers={...answers};
    if(CABINET_VALUE.has(nextAnswers.service||''))delete nextAnswers.service;
    const nextExtraction=extraction?{...extraction,facts:extraction.facts.filter(f=>f.field!=='service'||!CABINET_VALUE.has(f.value))}:undefined;
    return {answers:nextAnswers,extraction:nextExtraction};
  }
  if(!service)return {answers,extraction};
  return {answers:{...answers,service},extraction:extraction?{...extraction,facts:[...extraction.facts.filter(f=>f.field!=='service'),{field:'service' as const,value:service,confidence:1,source:'typed scope',evidence:text.slice(0,4000),basis:'stated' as const}],conflicts:extraction.conflicts.filter(c=>c.field!=='service')}:undefined};
}
