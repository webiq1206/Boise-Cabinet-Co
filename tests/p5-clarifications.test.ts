import test from 'node:test';
import assert from 'node:assert/strict';
import {instructionPrompts} from '../lib/p5/clarifications.ts';
import {require as tsxRequire} from 'tsx/cjs/api';
import {pathToFileURL} from 'node:url';
const resolver=()=>tsxRequire('../lib/p5/clarificationAnswer.ts',pathToFileURL(`${process.cwd()}/tests/p5-clarifications.test.ts`).href) as typeof import('../lib/p5/clarificationAnswer.ts');
import {emptyInstructions} from '../lib/p5/instructions.ts';
import {scopeQuestions} from '../lib/p5/adaptive.ts';
import type {ScopeExtraction} from '../lib/p5/scope.ts';
import {pricingScopeSource} from '../lib/p5/pricingSources.ts';
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
  const source={source:'historical-cabinet.pdf',page:1,sheet:'Estimate',revision:'1'};
  const item=(id:string,description:string,quantity:number|null,unit:string)=>({id,description,building:'Main',floor:'1',component:unit==='hours'?'cabinet labor':'cabinet top material',quantity,unit,basis:(quantity===null?'uncertain':'stated') as 'uncertain'|'stated',evidence:`${description}: ${quantity??'unmeasured'} ${unit}`,sources:[source],supersedes:[],issues:[]});
  const options=[['butcher','Butcher block',5],['painted','Matching painted MDF/wood',4],['laminate','Laminate',2],['quartz','Quartz',5]] as const;
  const takeoffs=[item('assembly','Base cabinet assembly labor',2,'hours'),item('installation','Base cabinet installation labor',8,'hours'),...options.flatMap(([id,label,hours])=>[item(`${id}-labor`,`${label} bench top fabrication and installation labor`,hours,'hours'),item(`${id}-material`,`${label} bench top material`,1,'each')])];
  const e:ScopeExtraction={summary:'Historical cabinet alternatives',facts:[
    {field:'laborHours',value:'15',confidence:.99,source:source.source,evidence:'Prior optional butcher-block labor total',basis:'stated'},
    {field:'cabinetBaseLf',value:'13.3',confidence:.99,source:source.source,evidence:'Painted bench top length 13.3 LF',basis:'stated'},
    {field:'cabinetTallLf',value:'0',confidence:.99,source:source.source,evidence:'Tall cabinet length not documented',basis:'inferred'},
  ],conflicts:[],reviewNotes:[],missingInformation:[],clarifications:[{field:'installation',question:'Is cabinet installation needed?',reason:'Labor scope'}],instructions:{...emptyInstructions(),questions:['Which bench top option should be included in the estimate?']},documentCoverage:{expectedPages:1,complete:true,pages:[{...source,status:'read',notes:[]}]},takeoffs};
  const prompt=instructionPrompts(e,{})[0];assert.deepEqual(prompt.values,options.map(option=>option[1]));
  let calls=0;const request:typeof fetch=async()=>{calls++;throw new Error('Alternative selection must not reread the retained PDF or call a provider.');};
    const result=await resolveInstructionAnswer(e,{service:'cabinet-product',laborHours:'15',materials:'Butcher block',cabinetBaseLf:'13.3',cabinetTallLf:'0'},{id:prompt.id,answer:'Option 2: matching painted MDF/wood bench top only. Exclude butcher block, laminate and quartz alternatives. Include the two cabinet units and 9 knobs/pulls. Assembly 2 hours + cabinet installation 8 hours + selected top fabrication/install 4 hours = 14 labor hours.'},[],request);
    assert.equal(calls,0);assert.equal(result.extraction?.documentCoverage,e.documentCoverage);
    assert.equal(result.answers.laborHours,'14');assert.equal(result.answers.service,'cabinet-install');
    assert.equal(result.answers.fixtures,'9 knobs/pulls');assert.match(result.answers.taskList||'',/Cabinet units: 2 each/);assert.match(result.answers.taskList||'',/Knobs\/pulls: 9 each/);
    assert.equal(result.answers.cabinetBaseLf,undefined);assert.equal(result.answers.cabinetTallLf,undefined);
    assert.equal(result.extraction?.clarifications?.some(question=>question.field==='installation'),false);
    assert.deepEqual(result.extraction?.facts.filter(fact=>fact.field==='service').map(fact=>fact.value),['cabinet-install']);
    assert.deepEqual(result.extraction?.facts.filter(fact=>fact.field==='materials').map(fact=>fact.value),['Matching painted MDF/wood']);
    assert.equal(result.extraction?.facts.some(fact=>fact.value==='cabinet-product'||/butcher block|laminate|quartz/i.test(fact.value)),false);
    const saved=JSON.stringify({answers:result.answers,takeoffs:result.extraction?.takeoffs});
    assert.match(saved,/painted MDF\/wood/i);for(const excluded of ['Butcher block','Laminate','Quartz'])assert.match(saved,new RegExp(excluded,'i'));
    assert.equal(result.extraction?.takeoffs?.filter(item=>item.unit==='hours'&&item.selectionStatus!=='excluded-alternative').reduce((sum,item)=>sum+(item.quantity||0),0),14);
    assert.equal(result.extraction?.takeoffs?.filter(item=>item.selectionStatus==='excluded-alternative').length,6);
    const priced=pricingScopeSource({text:'',answers:result.answers,extraction:result.extraction!,uploads:[],reviewedAt:'2026-09-12T00:00:00.000Z',corrections:[]});
    assert.equal(priced.extraction?.takeoffs?.some(item=>item.selectionStatus==='excluded-alternative'),false);
    for(const excluded of ['Butcher block','Laminate','Quartz'])assert.doesNotMatch(JSON.stringify(priced),new RegExp(excluded,'i'));
    assert.equal(Number((7467.69+1106.16).toFixed(2)),8573.85);
    assert.notEqual(8573.85,14575.38);
});
test('excluded option names never become the selected bench top and ambiguous replies stay unresolved',async()=>{
  const {applyAlternativeSelection}=await resolver();
  const source={source:'cabinet.pdf',page:1,sheet:'',revision:''};
  const make=(id:string,description:string,quantity:number)=>({id,description,building:'Main',floor:'1',component:'cabinet',quantity,unit:'hours',basis:'stated' as const,evidence:description,sources:[source],supersedes:[],issues:[]});
  const e:ScopeExtraction={summary:'',facts:[],conflicts:[],reviewNotes:[],missingInformation:[],instructions:{...emptyInstructions(),questions:['Which bench top option should be included in the estimate?']},takeoffs:[
    make('base','Cabinet assembly and installation',10),make('quartz','Quartz bench top',5),make('painted','Matching painted MDF/wood bench top',4),make('butcher','Butcher block bench top',5),make('laminate','Laminate bench top',2),
  ]};
  const selected=applyAlternativeSelection(e,{laborHours:'15'},e.instructions!.questions[0],'Matching painted MDF/wood only. Exclude butcher block, laminate, and quartz.');
  assert.equal(selected.answers.laborHours,'14');assert.equal(selected.extraction.takeoffs?.find(item=>item.id==='painted')?.selectionStatus,'selected');
  const ambiguous=applyAlternativeSelection(e,{laborHours:'15'},e.instructions!.questions[0],'Exclude butcher block, laminate, and quartz.');
  assert.equal(ambiguous.ambiguous,true);assert.equal(ambiguous.answers.laborHours,'15');
  assert.deepEqual(instructionPrompts(ambiguous.extraction,ambiguous.answers)[0].values,['Butcher block','Matching painted MDF/wood','Laminate','Quartz']);
  const contradictory=applyAlternativeSelection(e,{laborHours:'15'},e.instructions!.questions[0],'Option 2 matching painted MDF/wood. Exclude matching painted MDF/wood.');
  assert.equal(contradictory.ambiguous,true);assert.equal(contradictory.answers.laborHours,'15');
});
test('an unmeasured included labor item prevents a partial subtotal from becoming confirmed total labor',async()=>{
  const {applyAlternativeSelection}=await resolver();
  const source={source:'cabinet.pdf',page:1,sheet:'',revision:''};
  const takeoff=(id:string,description:string,quantity:number|null,basis:'stated'|'uncertain'='stated')=>({id,description,building:'Main',floor:'1',component:'cabinet labor',quantity,unit:'hours',basis,evidence:description,sources:[source],supersedes:[],issues:[]});
  const e:ScopeExtraction={summary:'',facts:[],conflicts:[],reviewNotes:[],missingInformation:[],instructions:{...emptyInstructions(),questions:['Which bench top option should be included in the estimate?']},takeoffs:[
    takeoff('assembly','Base cabinet assembly labor',2),takeoff('installation','Cabinet installation labor',8),takeoff('unknown','Additional cabinet finishing labor',null,'uncertain'),
    takeoff('butcher','Butcher block bench top labor',5),takeoff('painted','Matching painted MDF/wood bench top labor',4),takeoff('laminate','Laminate bench top labor',2),takeoff('quartz','Quartz bench top labor',5),
  ]};
  const result=applyAlternativeSelection(e,{laborHours:'15'},e.instructions!.questions[0],'Option 2');
  assert.equal(result.answers.laborHours,undefined);assert.match(result.extraction.clarifications?.[0].question||'',/still unmeasured/i);
});
test('alternative selection preserves genuine labor conflicts and distinct additive trade hours',async()=>{
  const {applyAlternativeSelection}=await resolver();
  const source={source:'mixed-scope.pdf',page:1,sheet:'',revision:''};
  const takeoff=(id:string,description:string,quantity:number)=>({id,description,building:'Main',floor:'1',component:description,quantity,unit:'hours',basis:'stated' as const,evidence:description,sources:[source],supersedes:[],issues:[]});
  const e:ScopeExtraction={summary:'',facts:[
    {field:'service',value:'addition',confidence:1,source:'visitor',evidence:'Driveway and addition scope',basis:'stated'},
    {field:'materials',value:'Driveway concrete',confidence:1,source:'visitor',evidence:'Driveway concrete',basis:'stated'},
    {field:'taskList',value:'Protect existing landscaping',confidence:1,source:'visitor',evidence:'Protect existing landscaping',basis:'stated'},
    {field:'installation',value:'Driveway form installation',confidence:1,source:'visitor',evidence:'Driveway form installation',basis:'stated'},
    {field:'fixtures',value:'Two bathroom sinks',confidence:1,source:'visitor',evidence:'Two bathroom sinks',basis:'stated'},
  ],conflicts:[{field:'laborHours',values:['16','18'],explanation:'Two sources disagree about the same finishing work.'}],reviewNotes:[],missingInformation:[],instructions:{...emptyInstructions(),questions:['Which bench top option should be included in the estimate?']},takeoffs:[
    takeoff('excavation','Driveway excavation labor',16),takeoff('concrete','Driveway concrete labor',24),takeoff('assembly','Cabinet assembly and installation labor',10),
    takeoff('butcher','Butcher block bench top labor',5),takeoff('painted','Matching painted MDF/wood bench top labor',4),takeoff('laminate','Laminate bench top labor',2),takeoff('quartz','Quartz bench top labor',5),
  ]};
  const result=applyAlternativeSelection(e,{service:'addition',laborHours:'15',materials:'Driveway concrete; Butcher block',taskList:'Protect existing landscaping',installation:'Driveway form installation',fixtures:'Two bathroom sinks'},e.instructions!.questions[0],'Option 2: matching painted MDF/wood. Include 9 knobs/pulls.');
  assert.equal(result.answers.laborHours,undefined);assert.deepEqual(result.extraction.conflicts,e.conflicts);
  assert.equal(result.answers.service,'addition');assert.match(result.answers.materials||'',/Driveway concrete/);assert.doesNotMatch(result.answers.materials||'',/Butcher block/i);
  assert.match(result.answers.taskList||'',/Protect existing landscaping/);assert.match(result.answers.installation||'',/Driveway form installation/);
  assert.match(result.answers.fixtures||'',/Two bathroom sinks/);assert.match(result.answers.fixtures||'',/9 knobs\/pulls/);
  for(const field of ['service','materials','taskList','installation'])assert.ok(result.extraction.facts.some(fact=>fact.field===field&&/Driveway|landscaping|addition/i.test(fact.value)));
  assert.deepEqual(result.extraction.takeoffs?.filter(item=>['excavation','concrete'].includes(item.id)).map(item=>item.quantity),[16,24]);
  assert.equal(result.extraction.takeoffs?.filter(item=>active(item)).filter(item=>item.unit==='hours').reduce((sum,item)=>sum+(item.quantity||0),0),54);
  const priced=pricingScopeSource({text:'',answers:result.answers,extraction:result.extraction,uploads:[],reviewedAt:'2026-09-12T00:00:00.000Z',corrections:[]});
  assert.equal(priced.answers.service,'addition');assert.match(priced.answers.materials||'',/Driveway concrete/);assert.match(priced.answers.fixtures||'',/Two bathroom sinks; 9 knobs\/pulls/);
});
function active(item:{selectionStatus?:string}){return item.selectionStatus!=='excluded-alternative';}
test('public clarification copy sanitizes current and legacy payload vocabulary',()=>{
 const extraction={...scope(),instructions:{...emptyInstructions(),questions:['Does knownProjectDetails conflict with projectDescription alternativeGroup takeoffs sourceVersion previousAnswers?']}};
 const copy=instructionPrompts(extraction,{}).map(item=>item.question).join(' ');
 for(const internal of ['knownProjectDetails','projectDescription','alternativeGroup','takeoffs','sourceVersion','previousAnswers'])assert.doesNotMatch(copy,new RegExp(internal,'i'));
});
