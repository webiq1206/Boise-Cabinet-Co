/**
 * This site's half of the document estimator's leads (owner decisions, 13, 17 and 18 November 2026).
 * Brand-owned: it holds the WIRING of this site, not the shared code (tests/p5-lead-intake.test.ts
 * holds that).
 *
 *  1. A visitor's unpriced project request: the `crm` channel of lib/p5/intakeDeliveryRuntime.ts is
 *     the P5 lead transport. It posts form `p5-project-request` with `team_alert: "site"`, filed
 *     under the primary team, with no price.
 *  2. The estimate the team publishes: `syncCrm()` in lib/p5/deliveryAdapter.ts posts form
 *     `p5-estimator` with `team_alert: "site"` and an `estimate` of kind `document`, customer amounts
 *     only, and throws when P5 refuses it.
 *
 * FAKE FETCH ONLY. Nothing here reaches a real site: every test that could send installs a fetch
 * double, and a post anywhere but the P5 intake address fails the test.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateIntakeLocalCrm} from '../lib/p5/intakeCrmValidation.ts';
import {runtimeIntakeTransports} from '../lib/p5/intakeDeliveryRuntime.ts';
import {syncCrm} from '../lib/p5/deliveryAdapter.ts';
import {P5_INTAKE_URL,P5_LEAD_RETRY_WINDOW_MS,PROJECT_REQUEST_LEADS_SINCE,p5LeadIntakeTransport,projectRequestHold,projectRequestIntakeBody,estimateIntakeBody} from '../lib/p5/p5LeadIntake.ts';
import {documentEstimateBody} from '../lib/p5/documentEstimateFigures.ts';
import {intakeDeliveryEnvelope,intakeLeadKey} from '../lib/p5/intakeDeliveryPayload.ts';
import {INTAKE_RUNTIME_PROOF} from '../lib/p5/intakeDeliveryPolicy.ts';
import {emptyIntakeDetails,type IntakeSnapshot} from '../lib/p5/intakeContract.ts';
import {INTAKE_SITES,intakeSite,routeIntake} from '../lib/p5/intakePolicy.ts';
import {COST_CATEGORIES,calculateP5Estimate,customerEstimate,type FinancePolicy,type PricingInput,type Service} from '../lib/p5/pricing.ts';
import {crmPayload} from '../lib/p5/deliveryPayloads.ts';
import {ESTIMATOR_BRAND} from '../lib/p5/brand.ts';

const site=intakeSite(ESTIMATOR_BRAND.id);
assert.ok(site&&site!=='p5','This brand is a specialty intake site');
const BRAND='Boise Cabinet Co';
const read=(file:string)=>readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const round2=(value:number)=>Math.round(value*100)/100;
const INTERNAL_WORD=/cost|margin|mark-?up|profit|overhead|contingenc/i;
const DRAFT='12345678-1234-4234-8234-123456789abc',digest='a'.repeat(64);
const ownService=site==='construction'?'addition':site==='cabinet'?'cabinet-install':site==='handyman'?'handyman':'kitchen';

// ---------------------------------------------------------------------------
// Doubles and fixtures
// ---------------------------------------------------------------------------

type Call={url:string;init:RequestInit};
const accepted=(body:unknown={ok:true,accepted:true,duplicate:false,alert:'none'},status=201)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
/** A fetch double. It records every call and never opens a connection. */
function fakeFetch(answer:(call:Call)=>Response|Promise<Response>=()=>accepted()){
  const calls:Call[]=[];
  const fetcher=(async(input:RequestInfo|URL,init?:RequestInit)=>{const call={url:String(input),init:init||{}};calls.push(call);return answer(call);}) as typeof fetch;
  return {calls,fetcher};
}
/** Run `work` with the global fetch replaced by a double and the named variables set (undefined removes one). */
async function withRuntime<T>(env:Record<string,string|undefined>,fetcher:typeof fetch,work:()=>Promise<T>):Promise<T>{
  const previousFetch=globalThis.fetch,previous=Object.keys(env).map(key=>[key,process.env[key]] as const);
  globalThis.fetch=fetcher;
  for(const [key,value] of Object.entries(env)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
  try{return await work();}
  finally{globalThis.fetch=previousFetch;for(const [key,value] of previous){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
}
const never=()=>fakeFetch(()=>{throw new Error('nothing may be posted here');});

function snapshot(service:string,extra:Record<string,unknown>={}):IntakeSnapshot{
  return {schema:1,projectId:`${site}:${DRAFT}`,reference:'CAB-4F7K2Q',originSite:site,currentSite:site,draftId:DRAFT,revision:1,contextVersion:0,savedAt:'2099-01-02T12:00:00.000Z',
    contact:{name:'Fictional Person',email:'customer@example.invalid',phone:'2085550100',preferredContact:'email'},
    details:{...emptyIntakeDetails(),desiredOutcome:'Fictional outcome',workContext:'Fictional existing home',transcript:[{id:'fictional-message',role:'user',text:'Fictional conversation',at:1,files:[]}]},
    scope:{text:'Fictional whole scope',answers:{service,address:'100 Fictional St',location:'Boise'},extraction:null,uploads:[]},
    routing:routeIntake(site as never,service),unresolved:[],...extra} as unknown as IntakeSnapshot;
}
const envelope=(request:IntakeSnapshot,channel:'crm'|'team'='crm')=>intakeDeliveryEnvelope(request,channel,digest);

const finance:FinancePolicy={annualOverhead:420000,annualRevenue:6000000,forecastSource:'TEST FIXTURE ONLY: conservative forecast',reviewedAt:'2026-09-10',approvedBy:['Nick']};
const CABINETS=[
  {description:'Remove existing kitchen cabinets and haul away',quantity:1,unit:'LS',unitCost:1873.37,trade:'Demolition'},
  {description:'Install shaker cabinets, painted',quantity:24,unit:'LF',unitCost:412.19,trade:'Cabinets'},
  {description:'Quartz countertops, eased edge',quantity:52.5,unit:'SF',unitCost:88.83,trade:'Countertops'},
  {description:'Crown, light rail and scribe trim',quantity:38,unit:'LF',unitCost:17.41},
];
/** A priced record exactly as the estimator builds one: the real pricing engine, then the real customer view. */
function pricedRecord(extra:Record<string,unknown>={}){
  const input:PricingInput={service:ownService as Service,revision:'fixture-revision-1',scopeSummary:'Fixture project scope',uncertainty:'low',locationProvided:true,
    lines:CABINETS.map((line,index)=>({id:`line-${index+1}`,category:'subcontractors',description:line.description,unit:line.unit,quantity:line.quantity,unitCost:line.unitCost,
      ...(line.trade?{trade:line.trade as never}:{}),quantitySource:'TEST signed scope',evidence:{basis:'written-quote',reference:'TEST quote',verifiedAt:'2026-09-01',validUntil:'2026-10-01'}})),
    coverage:COST_CATEGORIES.map(category=>({category,status:category==='subcontractors'?'included':'not-applicable',reason:'TEST ONLY: reviewed fixture coverage'})),
    risks:[],assumptions:[],exclusions:[],missingInformation:[],allowances:[]};
  const internal=calculateP5Estimate(input,finance,[],new Date('2026-09-10T12:00:00Z'));
  const customer=customerEstimate(internal,'Fixture scope summary for the customer');
  // What manualReview.ts and submitEndpoint.ts stamp at publication: brand, and the project the estimate answers.
  return {draftId:DRAFT,revision:2,projectId:`${site}:${DRAFT}`,brand:ESTIMATOR_BRAND.name,estimator:'p5-policy',
    contact:{name:'Fictional Person',email:'customer@example.invalid',phone:'(208) 555-0100'},
    scope:{text:'Fixture scope',answers:{service:ownService,address:'100 Fictional St',location:'Boise'}},internal,customer,...extra};
}
/** Every number an internal estimate holds that the customer must never be sent. */
function internalFigures(internal:Record<string,unknown>):number[]{
  const values:number[]=[];
  const walk=(value:unknown,key:string)=>{
    if(typeof value==='number'){if(INTERNAL_WORD.test(key)||/riskAdjusted|divisor|allocation/i.test(key))values.push(round2(value));return;}
    if(Array.isArray(value)){for(const item of value)walk(item,key);return;}
    if(value&&typeof value==='object')for(const [name,item] of Object.entries(value))walk(item,INTERNAL_WORD.test(key)||/allocation/i.test(key)?key:name);
  };
  walk(internal,'');
  return values.filter(value=>value>1);
}
const numbersIn=(value:unknown):number[]=>typeof value==='number'?[round2(value)]:Array.isArray(value)?value.flatMap(numbersIn):value&&typeof value==='object'?Object.values(value).flatMap(numbersIn):[];

// ---------------------------------------------------------------------------
// The contract check before any post
// ---------------------------------------------------------------------------

test('mock: a complete request on this site satisfies the P5 lead intake contract',()=>{
  assert.equal(validateIntakeLocalCrm(envelope(snapshot(ownService))),null);
  assert.equal(validateIntakeLocalCrm(envelope(snapshot(ownService,{contact:{name:'Fictional Phone Person',email:'',phone:'2085550100',preferredContact:'phone'}}))),null);
  // The check is the one the crm channel applies, not a second opinion.
  assert.equal(p5LeadIntakeTransport({enabled:true}).validate,projectRequestHold);
});

test('mock: a non-CRM channel, a request nobody can be reached about, a synthetic contact and a mismatched project are held before any send',()=>{
  const s=snapshot(ownService);
  assert.equal(validateIntakeLocalCrm(envelope(s,'team')),'payload-review');
  assert.equal(validateIntakeLocalCrm(envelope({...s,contact:{...s.contact,email:'',phone:''}})),'contact-review');
  assert.equal(validateIntakeLocalCrm({...envelope(s),leadKey:intakeLeadKey(`${site}:00000000-0000-4000-8000-000000000000`)}),'payload-review');
  assert.equal(validateIntakeLocalCrm({...envelope(s),request:undefined}),'payload-review');
  // A synthetic QA request never becomes a live lead, whatever the QA mailbox setting says.
  const qa={...s,contact:{...s.contact,name:'[QA] Fictional Person',email:'fictional@unapproved.invalid'}};
  const previous=process.env.SYNTHETIC_QA_EMAIL_ALLOWLIST;
  try{
    delete process.env.SYNTHETIC_QA_EMAIL_ALLOWLIST;assert.equal(validateIntakeLocalCrm(envelope(qa)),'synthetic-suppressed');
    process.env.SYNTHETIC_QA_EMAIL_ALLOWLIST='fictional@unapproved.invalid';assert.equal(validateIntakeLocalCrm(envelope(qa)),'synthetic-suppressed');
  }finally{if(previous===undefined)delete process.env.SYNTHETIC_QA_EMAIL_ALLOWLIST;else process.env.SYNTHETIC_QA_EMAIL_ALLOWLIST=previous;}
});

// ---------------------------------------------------------------------------
// 1. Project requests: the runtime's crm channel
// ---------------------------------------------------------------------------

test('the runtime crm channel is the P5 lead transport, and it is crm-disabled without the variable',async()=>{
  const s=snapshot(ownService),guard=never();
  await withRuntime({P5_CRM_DELIVERY:undefined,P5_REQUEST_LEADS_SINCE:undefined},guard.fetcher,async()=>{
    const {crm,customer,team}=await runtimeIntakeTransports();
    const reference=p5LeadIntakeTransport({enabled:true});
    assert.equal(crm.identityScope,reference.identityScope,'the same destination identity as the shared transport');
    assert.equal(crm.retryWindowMs,P5_LEAD_RETRY_WINDOW_MS);
    assert.equal(crm.validate,projectRequestHold);
    assert.notEqual(crm.identityScope,customer.identityScope);assert.equal(customer,team,'the mail channels are unchanged');
    assert.equal(await crm.readiness(s),'crm-disabled');
    await assert.rejects(crm.send(envelope(s)),/^Error: crm-disabled$/);
  });
  for(const value of ['off','ON','true','1',''])await withRuntime({P5_CRM_DELIVERY:value,P5_REQUEST_LEADS_SINCE:undefined},guard.fetcher,async()=>{
    const {crm}=await runtimeIntakeTransports();
    assert.equal(await crm.readiness(s),'crm-disabled',`P5_CRM_DELIVERY=${JSON.stringify(value)}`);
    await assert.rejects(crm.send(envelope(s)),/^Error: crm-disabled$/);
  });
  assert.equal(guard.calls.length,0,'nothing was posted while the channel was off');
});

test('with the variable on, only requests saved since the lead system began are sent; P5_REQUEST_LEADS_SINCE moves that moment',async()=>{
  const fresh=snapshot(ownService),old=snapshot(ownService,{savedAt:'2026-11-17T23:59:59.000Z'}),guard=never();
  assert.equal(PROJECT_REQUEST_LEADS_SINCE,'2026-11-18T00:00:00.000Z');
  await withRuntime({P5_CRM_DELIVERY:'on',P5_REQUEST_LEADS_SINCE:undefined},guard.fetcher,async()=>{
    const {crm}=await runtimeIntakeTransports();
    assert.equal(await crm.readiness(fresh),null);
    assert.equal(await crm.readiness(old),'crm-disabled','an older request the team already answered stays out');
    await assert.rejects(crm.send(envelope(old)),/^Error: crm-disabled$/);
  });
  await withRuntime({P5_CRM_DELIVERY:'on',P5_REQUEST_LEADS_SINCE:'2026-11-01T00:00:00.000Z'},guard.fetcher,async()=>{
    const {crm}=await runtimeIntakeTransports();
    assert.equal(await crm.readiness(old),null,'an older moment brings older requests in on purpose');
  });
  assert.equal(guard.calls.length,0);
});

test('a project request body: form p5-project-request, team_alert site, this site\'s brand routing and no price',async()=>{
  const s=snapshot(ownService),sent=envelope(s),{calls,fetcher}=fakeFetch();
  const providerId=await withRuntime({P5_CRM_DELIVERY:'on',P5_REQUEST_LEADS_SINCE:undefined},fetcher,async()=>(await runtimeIntakeTransports()).crm.send(sent));
  assert.equal(calls.length,1,'one post');
  assert.equal(calls[0].url,'https://p5homeco.com/api/leads/intake');assert.equal(P5_INTAKE_URL,calls[0].url);
  assert.equal(calls[0].init.method,'POST');assert.equal(calls[0].init.redirect,'error');
  assert.deepEqual(calls[0].init.headers,{'Content-Type':'application/json'},'no credential is sent');
  const body=JSON.parse(String(calls[0].init.body));
  const {message,...rest}=body;
  assert.deepEqual(rest,{
    brand:BRAND,name:'Fictional Person',email:'customer@example.invalid',phone:'2085550100',
    projectType:ownService,address:'100 Fictional St',city:'Boise',form:'p5-project-request',request_kind:'quote',contact_preference:'email',
    sourceDetail:`p5-project-request:${DRAFT}`,external_id:sent.leadKey,team_alert:'site',
  });
  assert.deepEqual(body,JSON.parse(JSON.stringify(projectRequestIntakeBody(sent))),'the shared builder, unchanged');
  assert.equal(body.external_id,intakeLeadKey(`${site}:${DRAFT}`),'the lead key: one per project');
  assert.equal(providerId,`p5-intake:${sent.leadKey}`);
  // The summary says where it came from and links to this site's own admin record.
  assert.match(message,/^Project request CAB-4F7K2Q, revision 1, sent from boisecabinet\.co\. No price has been given\.$/m);
  assert.match(message,/^Team: Boise Cabinet Co$/m);
  assert.match(message,new RegExp(`^Full request and files \\(staff sign-in\\): https://boisecabinet\\.co/api/admin/p5-intake\\?draftId=${DRAFT}&revision=1$`,'m'));
  // No price, in any shape.
  for(const forbidden of ['estimate','low','high','base','lines','price','range','team_notes','team_internal_notes','verified'])assert.equal(forbidden in body,false,forbidden);
  assert.doesNotMatch(JSON.stringify(body),/\$\s?\d/);
  assert.doesNotMatch(JSON.stringify(body),INTERNAL_WORD);
});

test('brand routing: the request is filed under its primary team, wherever on this site it was taken',()=>{
  // Cabinet work stays with this brand; a whole kitchen taken here is the remodeling team's, an addition the construction team's.
  for(const [service,brand] of [['cabinet-install','Boise Cabinet Co'],['cabinet-product','Boise Cabinet Co'],['kitchen','Boise Remodeling Co'],['bathroom','Boise Remodeling Co'],['addition','Boise Construction Co'],['handyman','Boise Handyman Co']] as const){
    const body=projectRequestIntakeBody(envelope(snapshot(service)));
    assert.equal(body.brand,brand,service);
    assert.match(String(body.message),/sent from boisecabinet\.co\./,service);
    assert.equal(body.form,'p5-project-request');assert.equal(body.team_alert,'site');assert.equal('estimate' in body,false);
    assert.ok(Object.values(INTAKE_SITES).some(value=>value.name===body.brand),'a brand name the intake accepts');
  }
});

test('a refused or failed request post throws a short error, and a synthetic request is never posted',async()=>{
  const sent=envelope(snapshot(ownService)),secret='SECRET-RESPONSE-BODY customer@example.invalid';
  const cases:[string,()=>Response,RegExp][]=[
    ['refused',()=>new Response(secret,{status:500}),/^P5 intake refused the project request \(HTTP 500\)$/],
    ['rate limited',()=>accepted({ok:false,error:secret},429),/^P5 intake refused the project request \(HTTP 429\)$/],
    ['not accepted',()=>accepted({ok:false,error:secret},200),/^P5 intake did not accept the project request$/],
    ['not json',()=>new Response(`<html>${secret}</html>`,{status:200}),/^P5 intake answer was not valid JSON$/],
    ['unreachable',()=>{throw new Error(`connect ECONNREFUSED ${secret}`);},/^P5 intake could not be reached; the project request was not confirmed$/],
  ];
  for(const [name,answer,expected] of cases){
    const {calls,fetcher}=fakeFetch(answer);
    const error=await withRuntime({P5_CRM_DELIVERY:'on',P5_REQUEST_LEADS_SINCE:undefined},fetcher,async()=>(await runtimeIntakeTransports()).crm.send(sent).then(()=>null,(e:Error)=>e));
    assert.ok(error instanceof Error,name);assert.match(error.message,expected,name);
    assert.ok(!error.message.includes('SECRET')&&!error.message.includes('@'),name);
    assert.equal(calls.length,1,`${name}: one post, never a second inside one send`);
  }
  const guard=never(),qa=snapshot(ownService,{contact:{name:'[QA] Fictional Person',email:'customer@example.invalid',phone:'',preferredContact:'email'}});
  await withRuntime({P5_CRM_DELIVERY:'on',P5_REQUEST_LEADS_SINCE:undefined},guard.fetcher,async()=>{
    const {crm}=await runtimeIntakeTransports();
    await assert.rejects(crm.send(envelope(qa)),/^Error: synthetic-suppressed$/);
    await assert.rejects(crm.send(envelope(snapshot(ownService),'team')),/^Error: payload-review$/);
  });
  assert.equal(guard.calls.length,0);
});

// ---------------------------------------------------------------------------
// 2. Published estimates: syncCrm
// ---------------------------------------------------------------------------

test('syncCrm posts the published estimate to the P5 intake: form p5-estimator, team_alert site, estimate of kind document',async()=>{
  assert.equal(ESTIMATOR_BRAND.name,BRAND);assert.equal(INTAKE_SITES[site as 'cabinet'].name,BRAND,'the name the intake expects');
  const record=pricedRecord({attribution:{utm_source:'google',utm_medium:'cpc',gclid:'abc123'}}),before=JSON.stringify(record);
  // The outbox passes no options, so the post goes through the global fetch.
  const {calls,fetcher}=fakeFetch();
  const providerId=await withRuntime({LEAD_DASHBOARD_KEY:'dashboard-credential-that-must-not-travel',LEAD_DASHBOARD_API_URL:'https://crm.example.invalid/api/external/leads'},fetcher,()=>syncCrm(record,'p5-outbox-key'));
  assert.equal(providerId,`p5-intake:p5-estimator:${DRAFT}`);
  assert.equal(calls.length,1,'one post');
  assert.equal(calls[0].url,'https://p5homeco.com/api/leads/intake','never the old lead dashboard');
  assert.equal(calls[0].init.method,'POST');assert.equal(calls[0].init.redirect,'error');
  assert.ok(calls[0].init.signal instanceof AbortSignal,'the post is timed');
  assert.deepEqual(calls[0].init.headers,{'Content-Type':'application/json'},'no credential and no idempotency header is sent');
  assert.doesNotMatch(String(calls[0].init.body),/dashboard-credential|crm\.example\.invalid/);
  const body=JSON.parse(String(calls[0].init.body));
  const {estimate,...lead}=body;
  assert.deepEqual(lead,{
    brand:BRAND,name:'Fictional Person',email:'customer@example.invalid',phone:'(208) 555-0100',
    projectType:ownService,address:'100 Fictional St',city:'Boise',message:'Fixture scope summary for the customer',
    form:'p5-estimator',sourceDetail:`p5-estimator:${DRAFT}`,external_id:`p5-estimator:${DRAFT}`,
    request_external_id:intakeLeadKey(`${site}:${DRAFT}`),
    utm_source:'google',utm_medium:'cpc',gclid:'abc123',
    team_alert:'site',
  });
  assert.deepEqual(body,JSON.parse(JSON.stringify(estimateIntakeBody(record,'p5-outbox-key',{brand:BRAND}))),'the shared builder, with this brand');
  // The figures.
  assert.deepEqual(estimate,JSON.parse(JSON.stringify(documentEstimateBody(record))));
  assert.deepEqual(Object.keys(estimate).sort(),['base','high','kind','label','lines','low','verified']);
  assert.equal(estimate.kind,'document');assert.equal(estimate.verified,true,'this server priced it');
  assert.deepEqual([estimate.low,estimate.high],[record.customer.range!.low,record.customer.range!.high],'the range the customer was shown');
  assert.equal(estimate.base,round2(record.internal.contractPrice),'the contract price');
  assert.equal(estimate.label,`Document estimate, ${ownService}`);
  assert.equal(estimate.lines.length,CABINETS.length);
  assert.equal(round2(estimate.lines.reduce((sum:number,line:{amount:number})=>sum+line.amount,0)),estimate.base,'the lines add up to the contract price, to the cent');
  // Customer amounts only. By word: no field and no text names an internal figure.
  assert.doesNotMatch(JSON.stringify(body),INTERNAL_WORD);
  for(const line of estimate.lines)for(const key of Object.keys(line))assert.ok(['title','description','quantity','unit','amount','division'].includes(key),key);
  for(const forbidden of ['team_notes','team_internal_notes','internal','lineItems','costBookSnapshot','scopePricing'])assert.equal(forbidden in body,false,forbidden);
  // By value: no cost, contingency, overhead or profit figure of the internal estimate is among the numbers sent.
  const secret=new Set(internalFigures(record.internal as unknown as Record<string,unknown>));
  assert.ok(secret.size>10,'the fixture really holds internal figures');
  for(const value of numbersIn(estimate).filter(value=>value>1&&!CABINETS.some(line=>line.quantity===value)))assert.ok(!secret.has(value),`${value} is an internal figure`);
  // Each line is that line's customer selling amount.
  record.internal.lines.forEach((line,index)=>assert.ok(Math.abs(estimate.lines[index].amount-line.sellingAmount)<=0.01*CABINETS.length));
  assert.equal(JSON.stringify(record),before,'the durable record is not changed');
  // The test seam: a fetch and an address a caller names, used instead of the global ones.
  const seam=fakeFetch(),guard=never();
  await withRuntime({},guard.fetcher,()=>syncCrm(record,'p5-outbox-key',{fetch:seam.fetcher,url:'https://staging.example.invalid/api/leads/intake'}));
  assert.equal(seam.calls.length,1);assert.equal(seam.calls[0].url,'https://staging.example.invalid/api/leads/intake');assert.equal(guard.calls.length,0);
});

test('one lead per project: the published estimate names the request it answers by the request\'s own id',()=>{
  const request=projectRequestIntakeBody(envelope(snapshot(ownService)));
  const estimate=estimateIntakeBody(pricedRecord(),'p5-outbox-key',{brand:ESTIMATOR_BRAND.name});
  assert.equal(estimate.request_external_id,request.external_id);
  assert.match(String(request.external_id),/^p5-intake-[0-9a-f]{64}$/);
  // A project handed to this site from another keeps the id its request was filed under.
  assert.equal(estimateIntakeBody(pricedRecord({projectId:`remodeling:${DRAFT}`}),'k',{brand:ESTIMATOR_BRAND.name}).request_external_id,intakeLeadKey(`remodeling:${DRAFT}`));
  // A record published before the stamp existed is read as a project that began on this site.
  assert.equal(estimateIntakeBody(pricedRecord({projectId:undefined}),'k',{brand:ESTIMATOR_BRAND.name}).request_external_id,request.external_id);
  // The estimate's own id belongs to the draft, not the revision: a revised estimate is the same lead.
  assert.equal(estimateIntakeBody(pricedRecord({revision:9}),'another-key',{brand:ESTIMATOR_BRAND.name}).external_id,estimate.external_id);
  // The publication paths stamp the project on the record.
  assert.match(read('lib/p5/manualReview.ts'),/const projectId=String\(draft\.payload\.intake\?\.projectId\|\|`\$\{brand\.id\}:\$\{draft\.id\}`\);/);
  assert.match(read('lib/p5/submitEndpoint.ts'),/projectId:draft\.intake\?\.projectId\|\|`\$\{brand\.id\}:\$\{id\}`/);
});

test('syncCrm throws on a refused post, with one post, no retry and nothing private in the message',async()=>{
  const record=pricedRecord(),secret='SECRET-RESPONSE-BODY customer@example.invalid';
  const timeout=()=>{const error=new Error('The operation was aborted due to timeout');error.name='TimeoutError';throw error;};
  const cases:[string,()=>Response,RegExp][]=[
    ['conflict',()=>accepted({duplicate:true,note:secret},409),/^P5 intake refused the estimate \(HTTP 409\)$/],
    ['too large',()=>new Response(secret,{status:413}),/^P5 intake refused the estimate \(HTTP 413\)$/],
    ['rejected',()=>accepted({ok:false,errors:[secret]},422),/^P5 intake refused the estimate \(HTTP 422\)$/],
    ['rate limited',()=>accepted({ok:false,error:secret},429),/^P5 intake refused the estimate \(HTTP 429\)$/],
    ['server error',()=>new Response(secret,{status:500}),/^P5 intake refused the estimate \(HTTP 500\)$/],
    ['not accepted',()=>accepted({ok:false,error:secret},200),/^P5 intake did not accept the estimate$/],
    ['ok missing',()=>accepted({accepted:true,note:secret},200),/^P5 intake did not accept the estimate$/],
    ['not json',()=>new Response(`<html>${secret}</html>`,{status:200}),/^P5 intake answer was not valid JSON$/],
    ['unreachable',()=>{throw new Error(`connect ECONNREFUSED https://user:password@private ${secret}`);},/^P5 intake could not be reached; the estimate was not confirmed$/],
    ['timed out',timeout,/^P5 intake did not answer in time; the estimate was not confirmed$/],
  ];
  for(const [name,answer,expected] of cases){
    const {calls,fetcher}=fakeFetch(answer);
    const error=await withRuntime({},fetcher,()=>syncCrm(record,'p5-outbox-key').then(()=>null,(e:Error)=>e));
    assert.ok(error instanceof Error,`${name}: a refused post is an error, never a delivery`);
    assert.match(error.message,expected,name);
    assert.ok(error.message.length<120&&!/SECRET|password|private|@/.test(error.message),name);
    assert.equal(calls.length,1,`${name}: one post, never a second`);
  }
});

test('syncCrm sends nothing for a synthetic QA record, a record nobody can be reached about, or an unsafe address',async()=>{
  const record=pricedRecord(),guard=never();
  await withRuntime({},guard.fetcher,async()=>{
    for(const qa of [{contact:{name:'[QA] Acceptance',email:'qa@example.invalid'}},{contact:{name:'SYNTHETIC QA run',email:'qa@example.invalid'}}])
      await assert.rejects(syncCrm({...record,...qa},'k'),/synthetic QA estimate is never forwarded/);
    await assert.rejects(syncCrm({...record,contact:{name:'Fictional Person',email:'',phone:''}},'k'),/email address or a phone number/);
    for(const url of ['http://p5homeco.com/api/leads/intake','https://user:password@p5homeco.com/api/leads/intake','not a url'])
      await assert.rejects(syncCrm(record,'k',{url}),/credential-free HTTPS endpoint/);
  });
  assert.equal(guard.calls.length,0,'nothing was posted');
});

test('figures that cannot be used: the lead still goes, without estimate and without team_alert, so P5 sends its usual email',async()=>{
  const {calls,fetcher}=fakeFetch();
  await withRuntime({},fetcher,()=>syncCrm({...pricedRecord(),customer:{summary:'Held for review',range:null}},'k'));
  const body=JSON.parse(String(calls[0].init.body));
  assert.equal(body.form,'p5-estimator');assert.equal(body.brand,BRAND);
  assert.equal('estimate' in body,false);assert.equal('team_alert' in body,false);
});

// ---------------------------------------------------------------------------
// Wiring and what was replaced
// ---------------------------------------------------------------------------

test('wiring: the runtime and the adapter use the P5 lead intake; the canonical receiver and the lead dashboard are not called from them',()=>{
  const runtime=read('lib/p5/intakeDeliveryRuntime.ts'),adapter=read('lib/p5/deliveryAdapter.ts'),strip=(source:string)=>source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  assert.match(strip(runtime),/import \{p5LeadIntakeTransport\} from '\.\/p5LeadIntake\.ts';/);
  assert.match(strip(runtime),/const crm=p5LeadIntakeTransport\(\{enabled:process\.env\.P5_CRM_DELIVERY==='on',since:process\.env\.P5_REQUEST_LEADS_SINCE\}\);/);
  assert.doesNotMatch(strip(runtime),/canonicalReview|P5_CANONICAL_REVIEW_TOKEN|LEAD_DASHBOARD/);
  // The forwarder is loaded on demand: tests/p5-intake-reply-to.test.ts runs the adapter with a fixed dependency list.
  assert.match(strip(adapter),/await import\("\.\/p5LeadIntake\.ts"\)/);
  assert.doesNotMatch(strip(adapter),/^import[^\n]*p5LeadIntake/m);
  assert.match(strip(adapter),/forwardEstimateToP5\(record,key,\{fetch:options\.fetch,url:options\.url,brand:brand\.name\}\)/);
  assert.doesNotMatch(strip(adapter),/deliverKeyedCrm|crmIdentity|LEAD_DASHBOARD|crmUrl|keyedCrm|deliveryPayloads/);
  // The canonical receiver stays in the repository, gated and untouched.
  assert.equal(INTAKE_RUNTIME_PROOF.crm,null);
  assert.match(read('lib/p5/canonicalReviewTransport.ts'),/export function canonicalReviewTransport/);
  for(const file of ['lib/p5/intakeDeliveryRuntime.ts','lib/p5/deliveryAdapter.ts','lib/p5/intakeCrmValidation.ts','tests/p5-intake-local-crm.test.ts'])assert.ok(!read(file).includes(String.fromCharCode(0x2014)),`${file} has no em dash`);
});

test('the lead dashboard payload this adapter used to post still refuses to truncate a contact (the builder stays in the repository)',()=>{
  // tests/p5-crm-delivery.test.ts held this through syncCrm while syncCrm posted to the lead dashboard.
  const record={...pricedRecord(),contact:{name:'N'.repeat(256),email:'customer@example.invalid',phone:''}};
  assert.throws(()=>crmPayload(record,'test-key'),/fullName.*no customer identity was truncated/);
});
