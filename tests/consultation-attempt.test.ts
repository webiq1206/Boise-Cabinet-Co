import test from 'node:test';
import assert from 'node:assert/strict';
import { ConsultationAttempt } from '../lib/consultationAttempt';
function setup(){let count=0;const cleared:string[]=[];return {state:new ConsultationAttempt(()=>`key-${++count}`,id=>cleared.push(id)),cleared};}
test('lost response retries exact serialized body, including original generated timestamp',()=>{
 const {state}=setup();const first=state.begin({name:'fixture'},id=>({id,time:1}));state.finish();
 const retry=state.begin({name:'fixture'},id=>({id,time:2}));assert.deepEqual(retry,first);
});
test('duplicate action is blocked while transport is pending',()=>{
 const {state}=setup();state.begin({},id=>({id}));assert.throws(()=>state.begin({},id=>({id})),/already sending/);
});
test('uncertain response cannot silently become a changed inquiry',()=>{
 const {state}=setup();state.begin({scope:'first'},id=>({id}));state.finish();assert.throws(()=>state.begin({scope:'changed'},id=>({id})),/unconfirmed/);
});
test('definite validation rejection allows correction with a new key',()=>{
 const {state,cleared}=setup();state.begin({scope:'invalid'},id=>({id}));state.confirmed();state.finish();assert.equal(state.begin({scope:'corrected'},id=>({id})).id,'key-2');assert.deepEqual(cleared,['key-1']);
});
test('confirmed save permits a legitimate separate inquiry',()=>{
 const {state}=setup();state.begin({},id=>({id}));state.confirmed();state.finish();assert.equal(state.begin({},id=>({id})).id,'key-2');
});
test('missing reference stops before transport preparation',()=>{
 const state=new ConsultationAttempt(()=>null,()=>{});assert.throws(()=>state.begin({},()=>{throw Error('must not run')}),/reference/);assert.equal(state.busy,false);
});
