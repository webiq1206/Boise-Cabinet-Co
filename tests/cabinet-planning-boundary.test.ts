import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as current from '../server/estimateEngine.ts';
import {planningRangeHandler,PLANNING_RANGE_BODY_LIMIT} from '../server/estimate/planningRange.ts';
import {planningRangeResponseSchema,planningRangeRequestSchema} from '../shared/planningRange.ts';
import {buildCombinedStoredEstimate as publicStored} from '../shared/estimateEngine.ts';
import {buildEstimateRecord as publicRecord} from '../shared/estimateRecord.ts';
import {buildEstimateRecord as serverRecord} from '../server/estimateRecord.ts';

const base=()=>current.getDefaultSelectionsForProject('kitchen');
const request=(body:unknown,headers:Record<string,string>={'content-type':'application/json'})=>new Request('http://localhost/api/estimate/planning-range',{method:'POST',headers,body:typeof body==='string'?body:JSON.stringify(body)});

test('all calculator branches retain exact baseline prices and public metadata',async()=>{
 const bytes=readFileSync(new URL('./fixtures/cabinet-public-planning-baseline.json',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'4aa66bd2920f658b8a43d216d346354ee6ca7b32058e16c0b99d00d85e0a1ad1');
 const baseline=JSON.parse(bytes.toString()) as {cases:{input:current.EstimateSelections;selectionsMade:number;result:current.EstimateResult|null}[];plans:{rooms:current.EstimateSelections[];combined:current.CombinedEstimateResult|null;stored:current.CombinedStoredEstimate|null}[]};
 assert.equal(baseline.cases.length,1256);
 for(const item of baseline.cases)assert.deepEqual(current.calculateEstimate(item.input,item.selectionsMade),item.result,JSON.stringify(item.input));
 for(const item of baseline.plans){
  assert.deepEqual(current.calculateCombinedEstimate(item.rooms),item.combined);
  assert.deepEqual(current.buildCombinedStoredEstimate(item.rooms),item.stored);
  if(item.rooms.length){
   const response=await planningRangeHandler(request({rooms:item.rooms}));assert.equal(response.status,200);
   const body=await response.json();assert.deepEqual(body.combined,item.combined);
   assert.deepEqual(body.singles,item.rooms.map(room=>current.calculateEstimate(room,current.roomSelectionsMade(room))));
  }
 }
});

test('the pure route exposes only the allowlisted customer projection and preserves stored/lead records',async(t)=>{
 t.mock.method(globalThis,'fetch',async()=>{throw new Error('No provider or downstream request is allowed');});
 const rooms=[base(),current.getDefaultSelectionsForProject('bathroom')];
 const response=await planningRangeHandler(request({rooms}));assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 const body=await response.json();assert.deepEqual(Object.keys(body).sort(),['combined','singles']);
 assert.deepEqual(Object.keys(body.singles[0]).sort(),['confidence','confidenceLabel','confidencePercent','included','priceHigh','priceLow','roi','scopeSummary','selectionsMade','totalSteps']);
 assert.deepEqual(Object.keys(body.combined.rooms[0]).sort(),['priceHigh','priceLow','project','projectLabel','scopeSummary','sizeLabel']);
 assert.doesNotMatch(JSON.stringify(body),/unitCost|directCost|annualOverhead|profitTarget|DEFAULT_FINANCE|P5 Cost Database|PB-\d/);
 assert.deepEqual(publicStored(rooms,body.combined),current.buildCombinedStoredEstimate(rooms));
 const input={rooms,capturedAt:'2026-11-15T20:00:00Z',notes:'Synthetic only'};
 assert.deepEqual(publicRecord(input,body.combined),serverRecord(input));
 const injected={...body,singles:[{...body.singles[0],directCost:1}]};assert.equal(planningRangeResponseSchema.safeParse(injected).success,false);
});

test('route rejects malformed, oversized, unknown and nonfinite inputs without leaking internals',async()=>{
 const cases:[unknown,number][]=[['{bad',400],[{rooms:[]},400],[{rooms:Array.from({length:11},base)},400],[{rooms:[{...base(),code:'08-71-01'}]},400],[{rooms:[base()],finance:{annualOverhead:1}},400],[{rooms:[base()],debug:true},400],[{rooms:[{...base(),size:-1}]},400],[{rooms:[{...base(),size:1001}]},400],[{rooms:[base()],selectionsMade:[]},400],[{rooms:[base()],selectionsMade:[11]},400]];
 for(const [body,status] of cases){const response=await planningRangeHandler(request(body));assert.equal(response.status,status,JSON.stringify(body));assert.doesNotMatch(await response.text(),/stack|unitCost|annualOverhead|Error:/);}
 assert.equal(planningRangeRequestSchema.safeParse({rooms:[{...base(),size:Infinity}]}).success,false);
 assert.equal((await planningRangeHandler(request({rooms:[base()]},{'content-type':'text/plain'}))).status,415);
 assert.equal((await planningRangeHandler(request(' '.repeat(PLANNING_RANGE_BODY_LIMIT+1)))).status,413);
 assert.equal((await planningRangeHandler(request({rooms:[base()]},{'content-type':'application/json','content-length':String(PLANNING_RANGE_BODY_LIMIT+1)}))).status,413);
 const response=await planningRangeHandler(request({rooms:[current.EMPTY_SELECTIONS]}));assert.equal(response.status,200);assert.deepEqual(await response.json(),{combined:null,singles:[null]});
});
