import type {ScopeAnswers,ScopeExtraction} from './scope.ts';

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
      const alternativeGroups=new Map<string,string[]>();
      for(const item of extraction?.takeoffs||[])if(item.alternativeGroup&&item.alternativeOption)alternativeGroups.set(item.alternativeGroup,[...new Set([...(alternativeGroups.get(item.alternativeGroup)||[]),item.alternativeOption])]);
      const alternatives=[...alternativeGroups].find(([group,options])=>options.length>1&&(questionKey(full).includes(questionKey(group))||options.some(option=>questionKey(full).includes(questionKey(option)))));
      const values=alternatives?.[1]||(/labor.only/i.test(full)&&/materials.only/i.test(full)?['Labor only','Materials only','Labor and materials']:
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
