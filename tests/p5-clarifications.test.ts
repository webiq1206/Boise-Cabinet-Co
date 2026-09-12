import test from 'node:test';
import assert from 'node:assert/strict';
import {instructionPrompts} from '../lib/p5/clarifications.ts';
import {require as tsxRequire} from 'tsx/cjs/api';
import {pathToFileURL} from 'node:url';
const resolver=()=>tsxRequire('../lib/p5/clarificationAnswer.ts',pathToFileURL(`${process.cwd()}/tests/p5-clarifications.test.ts`).href) as typeof import('../lib/p5/clarificationAnswer.ts');
import {emptyInstructions} from '../lib/p5/instructions.ts';
import {scopeQuestions} from '../lib/p5/adaptive.ts';
import type {ScopeExtraction} from '../lib/p5/scope.ts';
const scope=():ScopeExtraction=>({summary:'Trim scope',facts:[],conflicts:[],reviewNotes:[],missingInformation:[],instructions:{...emptyInstructions(),inclusions:['Trim'],exclusions:['Plumbing'],questions:['Labor only or materials only?','Should we include or exclude painting?']},documentCoverage:{expectedPages:80,complete:true,pages:[]},takeoffs:[]});

test('legacy paragraphs become distinct, concise questions and exact duplicates collapse',()=>{
  const e=scope();e.instructions!.questions=['Labor only or materials only? Should we include or exclude painting?','Labor only or materials only?'];
  const q=instructionPrompts(e,{});assert.equal(q.length,2);assert.deepEqual(q[0].values,['Labor only','Materials only','Labor and materials']);assert.equal(q[1].question,'Should we include or exclude painting?');
});
test('legacy company-fit questions use the service picker instead of an instruction loop',()=>{
  const e=scope();e.instructions!.questions=['Does the submitted scope require residential remodel work?','Which of the following services does your requested estimate cover?'];
  const q=scopeQuestions({},e);assert.equal(q.some(q=>q.instructionId),false);assert.ok(q.find(q=>q.field==='service')?.values?.length);
  e.instructions!.questions=['Which of the following services does your estimate cover? Should we include or exclude painting?'];
  assert.deepEqual(instructionPrompts(e,{}).map(q=>q.question),['Should we include or exclude painting?']);
});
test('clarification updates instructions without sending documents or changing page coverage',async()=>{
  const {resolveInstructionAnswer}=await resolver();
  process.env.OPENAI_API_KEY='synthetic';delete process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const e=scope();const id=instructionPrompts(e,{})[0].id;let calls=0;
  const request:typeof fetch=async(_url,options)=>{
    calls++;const body=JSON.parse(String(options?.body));assert.equal(body.input[0].content.some((c:any)=>c.type==='input_file'||c.type==='input_image'),false);
    const output={summary:'',facts:[],conflicts:[],reviewNotes:[],missingInformation:[],clarifications:[],instructions:{...e.instructions,laborOnly:true,questions:[]},pages:[],takeoffs:[]};
    return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(output)}]}]});
  };
  try{
    const result=await resolveInstructionAnswer(e,{service:'handyman'},{id,answer:'Labor only'},[],request);
    assert.equal(calls,1);assert.equal(result.extraction?.documentCoverage,e.documentCoverage);assert.equal(result.extraction?.takeoffs,e.takeoffs);
    assert.deepEqual(result.extraction?.instructions?.exclusions,['Plumbing']);assert.equal(result.extraction?.instructions?.laborOnly,true);
    assert.deepEqual(instructionPrompts(result.extraction,result.answers).map(q=>q.question),['Should we include or exclude painting?']);
    const repeated=await resolveInstructionAnswer(result.extraction,result.answers,{id,answer:'Labor only'},result.history,request);
    assert.equal(calls,1);assert.equal(repeated.history.length,1);assert.match(result.answers.estimatingInstructions||'',/Answer: Labor only/);
  }finally{delete process.env.OPENAI_API_KEY;}
});
test('invalid or stale clarification cannot replace the server extraction',async()=>{
  const {resolveInstructionAnswer}=await resolver();
  await assert.rejects(resolveInstructionAnswer(scope(),{},{id:'forged',answer:'yes'}),/question has changed/);
  await assert.rejects(resolveInstructionAnswer(scope(),{},{id:'x',answer:''}),/Enter an answer/);
});
test('painted top selection reconciles alternatives to fourteen hours without rereading pages',async()=>{
  const {resolveInstructionAnswer}=await resolver();
  process.env.OPENAI_API_KEY='synthetic';delete process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const source={source:'historical-cabinet.pdf',page:1,sheet:'Estimate',revision:'1'};
  const item=(id:string,description:string,quantity:number,unit:string,alternativeOption='')=>({id,description,building:'Main',floor:'1',component:unit==='hours'?'cabinet labor':'cabinet top material',quantity,unit,basis:'stated' as const,evidence:`${description}: ${quantity} ${unit}`,sources:[source],supersedes:[],issues:[],alternativeGroup:alternativeOption?'Cabinet top option':'',alternativeOption});
  const options=[['butcher','Option 1 - Butcher block',5],['painted','Option 2 - Painted MDF/wood bench top',4],['laminate','Option 3 - Laminate',2],['quartz','Option 4 - Quartz',5]] as const;
  const takeoffs=[item('assembly','Base cabinet assembly labor',2,'hours'),item('installation','Base cabinet installation labor',8,'hours'),...options.flatMap(([id,label,hours])=>[item(`${id}-labor`,`${label} labor`,hours,'hours',label),item(`${id}-material`,`${label} material`,1,'each',label)])];
  const e:ScopeExtraction={summary:'Historical cabinet alternatives',facts:[
    {field:'laborHours',value:'15',confidence:.99,source:source.source,evidence:'Prior optional butcher-block labor total',basis:'stated'},
    {field:'cabinetBaseLf',value:'13.3',confidence:.99,source:source.source,evidence:'Painted bench top length 13.3 LF',basis:'stated'},
    {field:'cabinetTallLf',value:'0',confidence:.99,source:source.source,evidence:'Tall cabinet length not documented',basis:'inferred'},
  ],conflicts:[],reviewNotes:[],missingInformation:[],clarifications:[{field:'installation',question:'Is cabinet installation needed?',reason:'Labor scope'}],instructions:{...emptyInstructions(),questions:['Which Cabinet top option should be included?']},documentCoverage:{expectedPages:1,complete:true,pages:[{...source,status:'read',notes:[]}]},takeoffs};
  const prompt=instructionPrompts(e,{})[0];assert.deepEqual(prompt.values,options.map(option=>option[1]));
  let calls=0;const request:typeof fetch=async(_url,request)=>{
    calls++;const body=JSON.parse(String(request?.body));assert.equal(body.input[0].content.some((part:any)=>part.type==='input_file'||part.type==='input_image'),false);
    const output={summary:'',facts:[],conflicts:[],reviewNotes:[],missingInformation:[],clarifications:[],instructions:{...e.instructions,questions:[],inclusions:['Option 2 - Painted MDF/wood bench top'],exclusions:['Butcher block','Laminate','Quartz']},pages:[],takeoffs:[]};
    return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(output)}]}]});
  };
  try{
    const result=await resolveInstructionAnswer(e,{service:'cabinet-product',laborHours:'15',materials:'Butcher block',cabinetBaseLf:'13.3',cabinetTallLf:'0'},{id:prompt.id,answer:'Option 2 - Painted MDF/wood bench top'},[],request);
    assert.equal(calls,1);assert.equal(result.extraction?.documentCoverage,e.documentCoverage);
    assert.equal(result.answers.laborHours,'14');assert.equal(result.answers.service,'cabinet-install');
    assert.equal(result.answers.cabinetBaseLf,undefined);assert.equal(result.answers.cabinetTallLf,undefined);
    assert.equal(result.extraction?.clarifications?.some(question=>question.field==='installation'),false);
    assert.deepEqual(result.extraction?.facts.filter(fact=>fact.field==='service').map(fact=>fact.value),['cabinet-install']);
    assert.deepEqual(result.extraction?.facts.filter(fact=>fact.field==='materials').map(fact=>fact.value),['Option 2 - Painted MDF/wood bench top']);
    assert.equal(result.extraction?.facts.some(fact=>fact.value==='cabinet-product'||/butcher block|laminate|quartz/i.test(fact.value)),false);
    const saved=JSON.stringify({answers:result.answers,takeoffs:result.extraction?.takeoffs});
    assert.match(saved,/Painted MDF\/wood/);for(const excluded of ['Butcher block','Laminate','Quartz'])assert.doesNotMatch(saved,new RegExp(excluded,'i'));
    assert.equal(result.extraction?.takeoffs?.filter(item=>item.unit==='hours').reduce((sum,item)=>sum+(item.quantity||0),0),14);
    assert.equal(Number((7467.69+1106.16).toFixed(2)),8573.85);
    assert.notEqual(8573.85,14575.38);
  }finally{delete process.env.OPENAI_API_KEY;}
});
test('public clarification copy sanitizes current and legacy payload vocabulary',()=>{
 const extraction={...scope(),instructions:{...emptyInstructions(),questions:['Does knownProjectDetails conflict with projectDescription alternativeGroup takeoffs sourceVersion previousAnswers?']}};
 const copy=instructionPrompts(extraction,{}).map(item=>item.question).join(' ');
 for(const internal of ['knownProjectDetails','projectDescription','alternativeGroup','takeoffs','sourceVersion','previousAnswers'])assert.doesNotMatch(copy,new RegExp(internal,'i'));
});
