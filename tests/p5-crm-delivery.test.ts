import test from 'node:test';
import assert from 'node:assert/strict';
import {assertCrmPayloadSize,crmPayload,CRM_PAYLOAD_HARD_BYTES,CRM_PAYLOAD_WARNING_BYTES} from '../lib/p5/deliveryPayloads.ts';
import {syncCrm} from '../lib/p5/deliveryAdapter.ts';

const record=(extra:any={})=>({draftId:'00000000-0000-4000-8000-000000000000',contact:{name:'QA',email:'qa@example.com',phone:''},scope:{text:'20 LF owner-supplied cabinet installation',answers:{service:'cabinet-install',location:'Caldwell'}},customer:{summary:'20 LF labor-only cabinet installation',range:{low:100,high:200}},internal:{lines:[],...extra}});

test('CRM payload is compact, UTF-8 measured, and keeps Cabinet routing fields',()=>{
  const payload=crmPayload(record(),'p5-key');
  const result=assertCrmPayloadSize(payload);
  assert.ok(result.bytes<CRM_PAYLOAD_WARNING_BYTES);
  assert.equal(payload.source,'boisecabinet.co');
  assert.equal(payload.estimate.brand,'Boise Cabinet Co');
  assert.equal(payload.estimate.scope.answers.service,'cabinet-install');
  assert.ok(result.bytes<CRM_PAYLOAD_HARD_BYTES);
});

test('CRM size preflight rejects an oversized internal line set before network',()=>{
  const oversized=record();
  oversized.scope.answers={...oversized.scope.answers,...Object.fromEntries(Array.from({length:80},(_,i)=>[`detail${i}`,'x'.repeat(2000)]))};
  const payload=crmPayload(oversized,'p5-key');
  assert.throws(()=>assertCrmPayloadSize(payload),/CRM payload is/);
});

test('CRM adapter never starts a request when the compact payload is still oversized',async()=>{
  const oldFetch=globalThis.fetch,oldToken=process.env.LEAD_DASHBOARD_KEY;
  const oversized=record();
  oversized.scope.answers={...oversized.scope.answers,...Object.fromEntries(Array.from({length:80},(_,i)=>[`detail${i}`,'x'.repeat(2000)]))};
  let calls=0;process.env.LEAD_DASHBOARD_KEY='test-token';
  globalThis.fetch=async()=>{calls++;throw new Error('fetch must not run');};
  try{await assert.rejects(()=>syncCrm(oversized,'p5-key'),/CRM payload is/);assert.equal(calls,0);}
  finally{globalThis.fetch=oldFetch;if(oldToken===undefined)delete process.env.LEAD_DASHBOARD_KEY;else process.env.LEAD_DASHBOARD_KEY=oldToken;}
});

test('HTTP 413 is permanent and never retried by the CRM adapter',async()=>{
  const oldFetch=globalThis.fetch,oldToken=process.env.LEAD_DASHBOARD_KEY;
  let calls=0;process.env.LEAD_DASHBOARD_KEY='test-token';
  globalThis.fetch=async()=>{calls++;return new Response('too large',{status:413});};
  try{await assert.rejects(()=>syncCrm(record(),'p5-key'),/permanently oversized.*manual review.*do not retry/);assert.equal(calls,1);}
  finally{globalThis.fetch=oldFetch;if(oldToken===undefined)delete process.env.LEAD_DASHBOARD_KEY;else process.env.LEAD_DASHBOARD_KEY=oldToken;}
});