import assert from 'node:assert/strict';
import test from 'node:test';
import { CONSULTATION_RETRY_SLOT, consultationSessionKey, clearConsultationSessionKey } from '../lib/consultationRetrySession';

const first = '11111111-1111-4111-8111-111111111111';
const second = '22222222-2222-4222-8222-222222222222';
function withStorage(run: (storage: Storage, values: Map<string,string>) => void) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const values = new Map<string,string>();
  const storage = {getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)} as unknown as Storage;
  Object.defineProperty(globalThis, 'window', {configurable:true,value:{sessionStorage:storage}});
  try { run(storage, values); } finally {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  }
}
test('reload reuses the sole UUID without saving any request fields', () => withStorage((_s, values) => {
  assert.equal(consultationSessionKey(()=>first), first);
  assert.equal(consultationSessionKey(()=>second), first);
  assert.deepEqual([...values], [[CONSULTATION_RETRY_SLOT, first]]);
}));
test('definite completion cleanup permits a separate inquiry; stale cleanup cannot remove it', () => withStorage(() => {
  consultationSessionKey(()=>first);
  assert.equal(clearConsultationSessionKey(first), true);
  assert.equal(consultationSessionKey(()=>second), second);
  assert.equal(clearConsultationSessionKey(first), false);
  assert.equal(consultationSessionKey(()=>first), second);
}));
test('corrupt marker blocks new identity without discarding evidence', () => withStorage((s) => {
  s.setItem(CONSULTATION_RETRY_SLOT, 'unexpected');
  assert.equal(consultationSessionKey(()=>first), null);
  assert.equal(s.getItem(CONSULTATION_RETRY_SLOT), 'unexpected');
}));
test('unavailable and silently failing storage permit a first in-memory transport key', () => withStorage((s) => {
  s.setItem=()=>{throw Error('unavailable')};
  assert.equal(consultationSessionKey(()=>first), first);
  s.setItem=()=>{};
  assert.equal(consultationSessionKey(()=>first), first);
  s.getItem=()=>{throw Error('unavailable')};
  assert.equal(consultationSessionKey(()=>first), first);
}));
test('failed cleanup preserves a conservative pending reference', () => withStorage((s) => {
  consultationSessionKey(()=>first);
  s.removeItem=()=>{throw Error('unavailable')};
  assert.equal(clearConsultationSessionKey(first), false);
  assert.equal(consultationSessionKey(()=>second), first);
}));
test('a failed read never overwrites an inaccessible prior marker', () => withStorage((s, values) => {
  s.setItem(CONSULTATION_RETRY_SLOT, first);
  s.getItem=()=>{throw Error('read blocked')};
  assert.equal(consultationSessionKey(()=>second), second);
  assert.equal(values.get(CONSULTATION_RETRY_SLOT), first);
}));
