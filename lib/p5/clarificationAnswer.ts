import {analyzeBatch} from './extraction';
import {clarificationContext,instructionPrompts,questionKey,type InstructionAnswer} from './clarifications';
import {DraftError} from './store';
import {SCOPE_TEXT_LIMIT,type ScopeAnswers,type ScopeExtraction} from './scope';
import {reconcileTakeoffs,type Takeoff} from './documentLedger';

const normalized=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const hourUnit=(unit:string)=>['hr','hrs','hour','hours'].includes(normalized(unit));
const cabinetTop=(value:string)=>/\b(?:bench ?top|counter ?top|work ?top|butcher block|laminate|quartz|painted mdf)\b/i.test(value);
const explicitZero=(value:string)=>/\b(?:0|zero|no)\s+(?:linear feet\s+of\s+)?(?:tall|base|upper|wall)\s+cabinets?\b/i.test(value);

/** Apply an explicit mutually-exclusive document option to the saved evidence without rereading the document. */
export function applyAlternativeSelection(extraction:ScopeExtraction,answers:ScopeAnswers,question:string,answer:string){
  const groups=new Map<string,Takeoff[]>();
  for(const item of extraction.takeoffs||[])if(item.alternativeGroup&&item.alternativeOption)groups.set(item.alternativeGroup,[...(groups.get(item.alternativeGroup)||[]),item]);
  const selectedGroup=[...groups].find(([group,items])=>normalized(question).includes(normalized(group))||items.some(item=>normalized(answer).includes(normalized(item.alternativeOption!))||normalized(item.alternativeOption!).includes(normalized(answer))));
  if(!selectedGroup)return {extraction,answers};
  const [group,options]=selectedGroup;
  const selected=options.find(item=>normalized(answer).includes(normalized(item.alternativeOption!))||normalized(item.alternativeOption!).includes(normalized(answer)));
  if(!selected)return {extraction,answers};
  const selectedLabel=normalized(selected.alternativeOption!);
  const removed=options.filter(item=>normalized(item.alternativeOption!)!==selectedLabel);
  const removedTerms=removed.flatMap(item=>[item.alternativeOption||'',item.description]).map(normalized).filter(Boolean);
  const mentionsRemoved=(value:string)=>removedTerms.some(term=>term.length>=4&&normalized(value).includes(term));
  const reconciled=reconcileTakeoffs((extraction.takeoffs||[]).filter(item=>item.alternativeGroup!==group||normalized(item.alternativeOption||'')===selectedLabel));
  const affectedFields=['laborHours','materials','alternates','taskList','installation','service'];
  const facts=extraction.facts.filter(f=>!affectedFields.includes(f.field)&&!mentionsRemoved(f.value+' '+f.evidence));
  const nextAnswers={...answers};
  for(const field of ['materials','alternates'] as const)if(nextAnswers[field]&&mentionsRemoved(nextAnswers[field]!))delete nextAnswers[field];
  const invalidCabinetFacts=facts.filter(f=>f.field==='cabinetBaseLf'&&cabinetTop(f.evidence)||f.field==='cabinetTallLf'&&f.value==='0'&&!explicitZero(f.evidence));
  for(const fact of invalidCabinetFacts)if(nextAnswers[fact.field]===fact.value)delete nextAnswers[fact.field];
  const safeFacts=facts.filter(f=>!invalidCabinetFacts.includes(f));
  const hours=reconciled.items.filter(item=>item.quantity!==null&&hourUnit(item.unit)&&!/\b(?:sub)?total\b/i.test(item.description+' '+item.evidence));
  if(hours.length){
    const total=hours.reduce((sum,item)=>sum+(item.quantity||0),0);
    const evidence=hours.map(item=>`${item.description}: ${item.quantity} ${item.unit} (${item.sources.map(source=>`${source.source} page ${source.page}`).join(', ')})`).join('; ');
    safeFacts.push({field:'laborHours',value:String(total),confidence:1,source:'clarification answer',evidence:`Selected scope labor: ${evidence}`,basis:'calculated'});
    nextAnswers.laborHours=String(total);
  }
  nextAnswers.materials=selected.alternativeOption!;
  nextAnswers.alternates=`Selected ${selected.alternativeOption}.`;
  nextAnswers.taskList=reconciled.items.map(item=>`${item.description}: ${item.quantity??'quantity to confirm'} ${item.unit}`).join('\n');
  const selectedEvidence=selected.sources.map(source=>`${source.source} page ${source.page}`).join(', ');
  safeFacts.push({field:'materials',value:selected.alternativeOption!,confidence:1,source:'clarification answer',evidence:`Selected ${selected.alternativeOption} from ${selectedEvidence}.`,basis:'stated'});
  safeFacts.push({field:'alternates',value:nextAnswers.alternates,confidence:1,source:'clarification answer',evidence:`Selected option from ${selectedEvidence}.`,basis:'stated'});
  safeFacts.push({field:'taskList',value:nextAnswers.taskList,confidence:1,source:'selected document option',evidence:`Selected option work retained from ${selectedEvidence}; unselected option takeoffs removed.`,basis:'calculated'});
  const installations=reconciled.items.filter(item=>/\b(?:install|installation)\b/i.test(item.description+' '+item.component));
  if(installations.length){
    nextAnswers.installation=installations.map(item=>item.description).join('; ');
    safeFacts.push({field:'installation',value:nextAnswers.installation,confidence:1,source:'selected document option',evidence:installations.map(item=>item.evidence).join('; '),basis:'stated'});
    if(reconciled.items.some(item=>/\bcabinet\b/i.test(item.description+' '+item.component))){
      nextAnswers.service='cabinet-install';
      safeFacts.push({field:'service',value:'cabinet-install',confidence:1,source:'selected document option',evidence:'Selected scope includes documented cabinet installation labor.',basis:'calculated'});
    }
  }
  return {answers:nextAnswers,extraction:{...extraction,facts:safeFacts,takeoffs:reconciled.items,conflicts:extraction.conflicts.filter(c=>!affectedFields.includes(c.field)),clarifications:(extraction.clarifications||[]).filter(q=>!affectedFields.includes(q.field)),missingInformation:[...new Set([...extraction.missingInformation,...reconciled.issues])]}};
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
