import type {ScopeAnswers,ScopeExtraction} from './scope.ts';
import type {Takeoff} from './documentLedger.ts';

export interface InstructionAnswer {id:string;question:string;answer:string}
export interface InstructionPrompt {id:string;question:string;detail?:string;values?:string[]}
export const questionKey=(text:string)=>text.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const publicQuestion=(text:string)=>text
  .replace(/\b(?:previousAnswers|knownProjectDetails|previous_answers|known_project_details)\b/gi,'details already provided')
  .replace(/\b(?:submittedScope|projectDescription|submitted_scope|project_description)\b/gi,'project description')
  .replace(/\b(?:sourceVersion|source_version)\b/gi,'saved project version')
  .replace(/\b(?:alternativeGroup|alternative_group)\b/gi,'option group')
  .replace(/\b(?:alternativeOption|alternative_option)\b/gi,'option')
  .replace(/\btakeoffs?\b/gi,'work quantities');
const serviceQuestion=(text:string)=>/which .*services|what .*remodel.*service|company.s scope|typical .*services|offered.*services|services.*offered|residential remodel|boise .*estimate|requested subset/i.test(text);
export interface DocumentAlternativeGroup {id:string;label:string;options:{label:string;items:Takeoff[]}[]}
const inferredBenchTop=(item:Takeoff)=>{
  const text=`${item.description} ${item.component} ${item.evidence}`;
  if(!/\b(?:bench ?top|counter ?top|work ?top|butcher block|laminate|quartz)\b/i.test(text))return '';
  if(/\bbutcher block\b/i.test(text))return 'Butcher block';
  if(/\b(?:matching )?painted\b/i.test(text)&&/\b(?:mdf|wood)\b/i.test(text))return 'Matching painted MDF/wood';
  if(/\blaminate\b/i.test(text))return 'Laminate';
  if(/\bquartz\b/i.test(text))return 'Quartz';
  return '';
};
export function documentAlternativeGroups(extraction:ScopeExtraction|null):DocumentAlternativeGroup[]{
  const groups=new Map<string,{label:string;options:Map<string,Takeoff[]>}>();
  const add=(id:string,label:string,option:string,item:Takeoff)=>{
    const group=groups.get(id)||{label,options:new Map<string,Takeoff[]>()};
    group.options.set(option,[...(group.options.get(option)||[]),item]);groups.set(id,group);
  };
  for(const item of extraction?.takeoffs||[])if(item.alternativeGroup&&item.alternativeOption)add(`explicit:${questionKey(item.alternativeGroup)}`,item.alternativeGroup,item.alternativeOption,item);
  const inferred:Array<[Takeoff,string]>=[];
  for(const item of extraction?.takeoffs||[])if(!item.alternativeGroup){const option=inferredBenchTop(item);if(option)inferred.push([item,option]);}
  if(new Set(inferred.map(([,option])=>option)).size>1)for(const [item,option] of inferred)add('inferred:bench-top','Bench top option',option,item);
  const benchOrder=['Butcher block','Matching painted MDF/wood','Laminate','Quartz'];
  return [...groups].map(([id,group])=>{
    const options=[...group.options].map(([label,items])=>({label,items}));
    options.sort((a,b)=>{
      const numbered=(value:string)=>Number(value.match(/\boption\s*(\d+)\b/i)?.[1]||0);
      const aNumber=numbered(a.label),bNumber=numbered(b.label);
      if(aNumber&&bNumber)return aNumber-bNumber;
      if(id==='inferred:bench-top')return benchOrder.indexOf(a.label)-benchOrder.indexOf(b.label);
      return 0;
    });
    return {id,label:group.label,options};
  }).filter(group=>group.options.length>1);
}
export function alternativeGroupForQuestion(extraction:ScopeExtraction|null,question:string){
  const q=questionKey(question),words=new Set(q.split(' ').filter(word=>word.length>2));
  return documentAlternativeGroups(extraction).find(group=>{
    if(group.id==='inferred:bench-top'&&/\b(?:bench ?top|counter ?top|work ?top|top option)\b/i.test(question))return true;
    const groupWords=questionKey(group.label).split(' ').filter(word=>word.length>2);
    return q.includes(questionKey(group.label))||group.options.some(option=>q.includes(questionKey(option.label)))||groupWords.filter(word=>words.has(word)).length>=2;
  });
}

/** One question per card, including older extractions that stored paragraphs. */
export function instructionPrompts(extraction:ScopeExtraction|null,answers:ScopeAnswers):InstructionPrompt[]{
  const result:InstructionPrompt[]=[];
  for(const raw of extraction?.instructions?.questions||[]){
    for(const part of raw.match(/[^?]+\??/g)||[]){
      const full=publicQuestion(part.replace(/\s+/g,' ').trim());if(!full)continue;
      // Filter each question separately so a legacy paragraph cannot lose a real scope decision.
      if(serviceQuestion(full))continue;
      const id=questionKey(full);
      if(result.some(q=>q.id===id))continue;
      const question=full.length<=240?full:'What should we include for this part of your project?';
      const alternatives=alternativeGroupForQuestion(extraction,full);
      const values=alternatives?.options.map(option=>option.label)||(/labor.only/i.test(full)&&/materials.only/i.test(full)?['Labor only','Materials only','Labor and materials']:
        /include or exclude|include.*or.*exclude/i.test(full)?['Include it','Exclude it']:undefined);
      result.push({id,question,...(question!==full?{detail:full}:{}),values});
    }
  }
  return result;
}

/** Answers remain scope data for the pricing audit, with original pages intact. */
export function clarificationContext(extraction:ScopeExtraction,question:string,answer:string){
  return JSON.stringify({
    task:'Resolve only this answered scope question using the answer below. Return the complete updated instructions, preserving every unrelated inclusion, exclusion, responsibility, building and floor. Remove this question when answered. Never ask it again because a page was not reuploaded. This is a clarification of a document review already completed. Do not produce page records, takeoffs, or unreadable-file notes. If the answer is insufficient, return one short, specific follow-up explaining the missing decision.',
    previousInstructions:extraction.instructions,question,answer,
  });
}
