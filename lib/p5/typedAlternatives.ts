import {emptyInstructions} from './instructions.ts';
import type {ScopeExtraction} from './scope.ts';

export const TYPED_OPTIONS_SOURCE='typed scope options';
/** Only explicit, mutually exclusive options with stated hours. Never infer a quantity. */
export function typedHourAlternatives(text:string){
 const groups:Array<{label:string;sourceText:string;options:Array<{label:string;hours:number}>}>=[];
 for(const match of text.matchAll(/\b(?:choose|select)\s+one\s+([^:\n.!?]{1,80}):\s*([^!?\n]+?)(?=\.(?:\s|$)|[!?\n]|$)/gi)){
  const parts=match[2].split(/[,;]\s*/).map(part=>part.trim()).filter(Boolean);
  const options=parts.map(part=>part.match(/^(?:or\s+)?(.+?)\s+(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)$/i));
  if(parts.length<2||parts.length>12||options.some(option=>!option))continue;
  groups.push({label:match[1].trim(),sourceText:match[0].trim(),options:options.map(option=>({label:option![1].trim(),hours:Number(option![2])}))});
 }
 return groups;
}
export function retainTypedAlternatives(text:string,extraction:ScopeExtraction){
 const groups=typedHourAlternatives(text);if(!groups.length)return extraction;
 const instructions=extraction.instructions||emptyInstructions();
 const questions=[...instructions.questions];
 for(const group of groups)if(!questions.some(question=>question.toLowerCase().includes(group.label.toLowerCase())||group.options.filter(option=>question.toLowerCase().includes(option.label.toLowerCase())).length>=2))questions.push(`Which ${group.label} should we include?`);
 return {...extraction,facts:[...extraction.facts.filter(f=>f.source!==TYPED_OPTIONS_SOURCE),...groups.map(group=>({field:'alternates' as const,value:group.sourceText,confidence:1,source:TYPED_OPTIONS_SOURCE,evidence:group.sourceText,basis:'stated' as const}))],instructions:{...instructions,questions}};
}
