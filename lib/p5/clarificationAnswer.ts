import {analyzeBatch} from './extraction';
import {alternativeGroupForQuestion,clarificationContext,instructionPrompts,questionKey,type DocumentAlternativeGroup,type InstructionAnswer} from './clarifications';
import {DraftError} from './store';
import {SCOPE_TEXT_LIMIT,type ScopeAnswers,type ScopeExtraction} from './scope';
import {reconcileTakeoffs,type Takeoff} from './documentLedger';

const normalized=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const hourUnit=(unit:string)=>['hr','hrs','hour','hours'].includes(normalized(unit));
const cabinetTop=(value:string)=>/\b(?:bench ?top|counter ?top|work ?top|butcher block|laminate|quartz|painted mdf)\b/i.test(value);
const explicitZero=(value:string)=>/\b(?:0|zero|no)\s+(?:linear feet\s+of\s+)?(?:tall|base|upper|wall)\s+cabinets?\b/i.test(value);
const numberValue=(value:string)=>({one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10}[value.toLowerCase() as 'one']||Number(value));
const optionMention=(text:string,label:string)=>{
  const words=normalized(label).split(' ').filter(word=>word.length>2&&!['option','matching','painted','bench','top'].includes(word));
  return words.length>0&&words.every(word=>normalized(text).includes(word));
};
function answerSelection(group:DocumentAlternativeGroup,answer:string){
  const segments=answer.split(/[.;\n]+|,?\s+(?=(?:exclude|excluding|without|do not include|not included)\b)/i).map(value=>value.trim()).filter(Boolean);
  const positive=segments.filter(value=>!/\b(?:exclude|excluding|without|do not include|not included)\b/i.test(value)).join(' ');
  const negative=segments.filter(value=>/\b(?:exclude|excluding|without|do not include|not included)\b/i.test(value)).join(' ');
  const numbered=[...positive.matchAll(/\boption\s*([1-9])\b/gi)].map(match=>Number(match[1])).filter(value=>value>=1&&value<=group.options.length);
  const numberedSelection=new Set(numbered).size===1?group.options[numbered[0]-1]:null;
  const mentioned=group.options.filter(option=>optionMention(positive,option.label));
  const namedSelection=mentioned.length===1?mentioned[0]:null;
  if(numberedSelection&&namedSelection&&numberedSelection!==namedSelection)return null;
  const selected=numberedSelection||namedSelection;
  if(!selected||optionMention(negative,selected.label))return null;
  return selected;
}
const activeTakeoff=(item:Takeoff)=>item.selectionStatus!=='excluded-alternative';

/** Apply an explicit mutually-exclusive document option to the saved evidence without rereading the document. */
export function applyAlternativeSelection(extraction:ScopeExtraction,answers:ScopeAnswers,question:string,answer:string){
  const group=alternativeGroupForQuestion(extraction,question);
  if(!group)return {extraction,answers,handled:false,ambiguous:false};
  const selected=answerSelection(group,answer);
  const otherQuestions=(extraction.instructions?.questions||[]).filter(value=>questionKey(value)!==questionKey(question));
  if(!selected){
    const followUp=`Choose one ${group.label.toLowerCase()}: ${group.options.map(option=>option.label).join(', ')}.`;
    return {answers,handled:true,ambiguous:true,extraction:{...extraction,instructions:{...extraction.instructions!,questions:[followUp,...otherQuestions]}}};
  }
  const optionByItem=new Map(group.options.flatMap(option=>option.items.map(item=>[item,option.label] as const)));
  const selectedLabel=normalized(selected.label);
  const updated=(extraction.takeoffs||[]).map(item=>{
    const option=optionByItem.get(item);if(!option)return item;
    return {...item,alternativeGroup:item.alternativeGroup||group.label,alternativeOption:item.alternativeOption||option,selectionStatus:normalized(option)===selectedLabel?'selected' as const:'excluded-alternative' as const};
  });
  const removed=group.options.filter(option=>normalized(option.label)!==selectedLabel);
  const removedTerms=removed.flatMap(option=>[option.label,...option.items.map(item=>item.description)]).map(normalized).filter(Boolean);
  const mentionsRemoved=(value:string)=>removedTerms.some(term=>term.length>=4&&normalized(value).includes(term));
  const reconciled=reconcileTakeoffs(updated);
  const allOptionTerms=group.options.flatMap(option=>[option.label,...option.items.map(item=>item.description)]).map(normalized).filter(Boolean);
  const mentionsOption=(value:string)=>allOptionTerms.some(term=>term.length>=4&&normalized(value).includes(term));
  const preserveUnrelated=(value:string|undefined)=>value?.split(/[;\n]+/).map(part=>part.trim()).filter(part=>part&&!mentionsOption(part)).join('; ')||'';
  const facts=extraction.facts.filter(f=>!mentionsRemoved(f.value+' '+f.evidence));
  const nextAnswers={...answers};
  const invalidCabinetFacts=facts.filter(f=>f.field==='cabinetBaseLf'&&cabinetTop(f.evidence)||f.field==='cabinetTallLf'&&f.value==='0'&&!explicitZero(f.evidence));
  for(const fact of invalidCabinetFacts)if(nextAnswers[fact.field]===fact.value)delete nextAnswers[fact.field];
  const safeFacts=facts.filter(f=>!invalidCabinetFacts.includes(f));
  const included=reconciled.items.filter(activeTakeoff);
  const laborTakeoffs=included.filter(item=>hourUnit(item.unit)&&!/\b(?:sub)?total\b/i.test(item.description+' '+item.evidence));
  const hours=laborTakeoffs.filter(item=>item.quantity!==null&&item.basis!=='uncertain');
  const laborIncomplete=laborTakeoffs.some(item=>item.quantity===null||item.basis==='uncertain');
  const laborConflicted=extraction.conflicts.some(conflict=>conflict.field==='laborHours');
  if(hours.length&&!laborIncomplete&&!laborConflicted){
    const total=hours.reduce((sum,item)=>sum+(item.quantity||0),0);
    const evidence=hours.map(item=>`${item.description}: ${item.quantity} ${item.unit} (${item.sources.map(source=>`${source.source} page ${source.page}`).join(', ')})`).join('; ');
    safeFacts.push({field:'laborHours',value:String(total),confidence:1,source:'clarification answer',evidence:`Selected scope labor: ${evidence}`,basis:'calculated'});
    nextAnswers.laborHours=String(total);
  }else delete nextAnswers.laborHours;
  nextAnswers.materials=[preserveUnrelated(nextAnswers.materials),selected.label].filter(Boolean).join('; ');
  nextAnswers.alternates=[preserveUnrelated(nextAnswers.alternates),`Selected ${selected.label}.`].filter(Boolean).join(' ');
  const cabinetMatch=answer.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+cabinet units?\b/i);
  const hardwareMatch=answer.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(?:knobs?\s*\/\s*pulls?|knobs?\s+and\s+pulls?|knobs?|pulls?)\b/i);
  const taskLines=included.map(item=>`${item.description}: ${item.quantity??'quantity to confirm'} ${item.unit}`);
  if(cabinetMatch&&!included.some(item=>item.quantity===numberValue(cabinetMatch[1])&&!hourUnit(item.unit)&&/\bcabinet\b/i.test(item.description+' '+item.component)))taskLines.push(`Cabinet units: ${numberValue(cabinetMatch[1])} each`);
  if(hardwareMatch&&!included.some(item=>item.quantity===numberValue(hardwareMatch[1])&&!hourUnit(item.unit)&&/\b(?:knob|pull|hardware)\b/i.test(item.description+' '+item.component)))taskLines.push(`Knobs/pulls: ${numberValue(hardwareMatch[1])} each`);
  const retainedTasks=(nextAnswers.taskList||'').split('\n').map(line=>line.trim()).filter(line=>line&&!mentionsOption(line));
  nextAnswers.taskList=[...new Set([...retainedTasks,...taskLines])].join('\n');
  if(hardwareMatch){
    const retainedFixtures=(nextAnswers.fixtures||'').split(/[;\n]+/).map(part=>part.trim()).filter(part=>part&&!/\b(?:knob|pull|cabinet hardware)\b/i.test(part));
    nextAnswers.fixtures=[...retainedFixtures,`${numberValue(hardwareMatch[1])} knobs/pulls`].join('; ');
  }
  const selectedEvidence=[...new Set(selected.items.flatMap(item=>item.sources.map(source=>`${source.source} page ${source.page}`)))].join(', ');
  safeFacts.push({field:'materials',value:selected.label,confidence:1,source:'clarification answer',evidence:`Selected ${selected.label} from ${selectedEvidence}.`,basis:'stated'});
  safeFacts.push({field:'alternates',value:nextAnswers.alternates,confidence:1,source:'clarification answer',evidence:`Selected option from ${selectedEvidence}.`,basis:'stated'});
  safeFacts.push({field:'taskList',value:nextAnswers.taskList,confidence:1,source:'selected document option',evidence:`Selected option work retained from ${selectedEvidence}; unselected option takeoffs preserved as inactive source history.`,basis:'calculated'});
  if(hardwareMatch)safeFacts.push({field:'fixtures',value:nextAnswers.fixtures!,confidence:1,source:'clarification answer',evidence:hardwareMatch[0],basis:'stated'});
  const installations=included.filter(item=>/\b(?:install|installation)\b/i.test(item.description+' '+item.component));
  if(installations.length){
    nextAnswers.installation=[preserveUnrelated(nextAnswers.installation),...installations.map(item=>item.description)].filter(Boolean).join('; ');
    safeFacts.push({field:'installation',value:nextAnswers.installation,confidence:1,source:'selected document option',evidence:installations.map(item=>item.evidence).join('; '),basis:'stated'});
    if(included.some(item=>/\bcabinet\b/i.test(item.description+' '+item.component))&&(!nextAnswers.service||['cabinet-product','cabinet-install'].includes(nextAnswers.service))){
      nextAnswers.service='cabinet-install';
      for(let index=safeFacts.length-1;index>=0;index--)if(safeFacts[index].field==='service')safeFacts.splice(index,1);
      safeFacts.push({field:'service',value:'cabinet-install',confidence:1,source:'selected document option',evidence:'Selected scope includes documented cabinet installation labor.',basis:'calculated'});
    }
  }
  const cabinetOnlyService=!answers.service||['cabinet-product','cabinet-install'].includes(answers.service);
  const clarifications=(extraction.clarifications||[]).filter(q=>!(q.field==='installation'&&/\bcabinet\b/i.test(q.question+' '+q.reason))&&!(q.field==='service'&&cabinetOnlyService));
  if(laborIncomplete)clarifications.unshift({field:'laborHours',question:'Some included labor is still unmeasured. How many additional labor hours should be included?',reason:'A partial labor subtotal cannot be treated as the complete project labor total.'});
  return {answers:nextAnswers,handled:true,ambiguous:false,extraction:{...extraction,instructions:{...extraction.instructions!,questions:otherQuestions},facts:safeFacts,takeoffs:reconciled.items,conflicts:extraction.conflicts,clarifications,missingInformation:[...new Set([...extraction.missingInformation,...reconciled.issues])]}};
}

export async function resolveInstructionAnswer(extraction:ScopeExtraction|null,answers:ScopeAnswers,raw:unknown,prior:InstructionAnswer[]=[],request=fetch){
  const value=raw as {id?:unknown;answer?:unknown};
  if(typeof value?.id!=='string'||typeof value.answer!=='string'||!value.answer.trim()||value.answer.length>SCOPE_TEXT_LIMIT)throw new DraftError('Enter an answer to continue.');
  const prompt=instructionPrompts(extraction,answers).find(q=>q.id===value.id);
  if(!prompt||!extraction){
    if(prior.some(p=>p.id===value.id&&p.answer===String(value.answer).trim()))return {extraction,answers,history:prior};
    throw new DraftError('This question has changed. Refresh your saved project to continue.',409);
  }
  const answer=value.answer.trim(),question=prompt.detail||prompt.question;
  const local=applyAlternativeSelection(extraction,answers,question,answer);
  if(local.handled){
    const record={id:prompt.id,question,answer};
    return {extraction:local.extraction,answers:local.answers,history:[...prior,record]};
  }
  const result=await analyzeBatch(clarificationContext(extraction,question,answer),[],answers,request,60000);
  if(!result.extraction.instructions)throw new DraftError('Your answer is still here. We could not save its scope update. Please retry.',503);
  const instructions=result.extraction.instructions;
  const repeated=instructions.questions.find(q=>questionKey(q)===prompt.id);
  if(repeated)throw new DraftError('Please make the scope decision explicit, such as what to include or exclude. Your answer is saved in this tab.');
  // Preserve other unanswered questions even if a provider omitted them.
  instructions.questions=[...new Set([...instructionPrompts(extraction,answers).filter(q=>q.id!==prompt.id).map(q=>q.detail||q.question),...instructions.questions])];
  const selected=applyAlternativeSelection({...extraction,instructions},answers,question,answer);
  const record={id:prompt.id,question,answer};
  const combined=[selected.answers.estimatingInstructions,`Question: ${question}\nAnswer: ${answer}`].filter(Boolean).join('\n\n');
  if(combined.length>SCOPE_TEXT_LIMIT)throw new DraftError('Upload the additional scope notes as a document to preserve them in full.');
  return {extraction:selected.extraction,answers:{...selected.answers,estimatingInstructions:combined},history:[...prior,record]};
}
