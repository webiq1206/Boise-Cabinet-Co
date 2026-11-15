import test from 'node:test';
import assert from 'node:assert/strict';
import {requestPlanningEstimate,PLANNING_REQUEST_TIMEOUT_MS} from '../lib/estimate/usePlanningEstimate.ts';
import {EMPTY_SELECTIONS} from '../shared/estimateEngine.ts';

test('deadline covers a hung response body and a subsequent retry can succeed',async(t)=>{
 t.mock.timers.enable({apis:['setTimeout']});
 let calls=0,bodyStarted=false,firstSignal:AbortSignal|undefined;
 t.mock.method(globalThis,'fetch',async(_input,init)=>{
  calls++;
  if(calls===1){firstSignal=init?.signal as AbortSignal;return {ok:true,json:()=>{bodyStarted=true;return new Promise(()=>{});}} as Response;}
  return new Response(JSON.stringify({combined:null,singles:[null]}),{status:200});
 });
 const waiting=requestPlanningEstimate([EMPTY_SELECTIONS]);
 await Promise.resolve();await Promise.resolve();assert.equal(bodyStarted,true);
 const rejected=assert.rejects(waiting,/timed out/);
 t.mock.timers.tick(PLANNING_REQUEST_TIMEOUT_MS);await rejected;
 assert.equal(firstSignal?.aborted,true);
 assert.deepEqual(await requestPlanningEstimate([EMPTY_SELECTIONS]),{combined:null,singles:[null]});
 assert.equal(calls,2);
});
test('superseded requests cancel separately from an actionable timeout',async(t)=>{
 t.mock.method(globalThis,'fetch',async()=>new Promise(()=>{}));
 const controller=new AbortController();const waiting=requestPlanningEstimate([EMPTY_SELECTIONS],undefined,controller.signal);
 const rejected=assert.rejects(waiting,error=>error instanceof DOMException&&error.name==='AbortError');
 controller.abort();await rejected;
});
test('unexpected private fields and invalid public response counts are rejected',async(t)=>{
 let body:unknown={combined:null,singles:[null],finance:{annualOverhead:1}};
 t.mock.method(globalThis,'fetch',async()=>new Response(JSON.stringify(body),{status:200}));
 await assert.rejects(requestPlanningEstimate([EMPTY_SELECTIONS]));
 body={combined:null,singles:[null,null]};await assert.rejects(requestPlanningEstimate([EMPTY_SELECTIONS]),/did not match/);
});
