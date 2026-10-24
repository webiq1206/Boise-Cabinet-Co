import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { saveConsultationOnce, ConsultationReplayConflict } from '../lib/consultationReplay';
import type { db } from '../lib/db';

const key='11111111-1111-4111-8111-111111111111';
const request={name:'Offline Fixture',phone:'2085550100',email:'fixture@example.invalid',zip:'',projectType:'built-ins'};
const payload={...request,source:'consultation',message:'Offline cabinet scope'};
// Only these existing tables are needed; no production connection or migration.
const ddl=`CREATE TABLE consultation_requests (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, phone text NOT NULL,
 email text NOT NULL, zip text NOT NULL, address text, city text, property_profile jsonb,
 project_type text NOT NULL, message text, estimate_project text, estimate_finish text,
 estimate_low numeric(10,2), estimate_high numeric(10,2), status text NOT NULL DEFAULT 'new',
 created_at timestamp DEFAULT now());
 CREATE TABLE submissions (id varchar PRIMARY KEY DEFAULT gen_random_uuid(),lead_id varchar,
 form_type text NOT NULL,raw_payload jsonb NOT NULL,source_page text,submitted_at timestamp NOT NULL DEFAULT now());`;
const adapter=(pg:PGlite)=>drizzle(pg) as unknown as NonNullable<typeof db>;
test('concurrent matching keys commit one request/receipt and one winning notification intent',async()=>{
 const pg=new PGlite();await pg.exec(ddl);
 try{
  const outcomes=await Promise.all(Array.from({length:12},()=>saveConsultationOnce(adapter(pg),key,payload,request)));
  assert.equal(outcomes.filter(x=>!x.replayed).length,1);
  assert.equal(new Set(outcomes.map(x=>x.requestId)).size,1);
  assert.equal((await pg.query<{count:number}>('SELECT count(*)::int AS count FROM consultation_requests')).rows[0].count,1);
  assert.equal((await pg.query<{count:number}>('SELECT count(*)::int AS count FROM submissions')).rows[0].count,1);
 }finally{await pg.close();}
});
test('response loss and application restart replay the durable receipt',async()=>{
 const folder=await mkdtemp(join(tmpdir(),'p5-replay-offline-'));let pg=new PGlite(folder);
 try{
  await pg.exec(ddl);const first=await saveConsultationOnce(adapter(pg),key,payload,request);
  await pg.close();pg=new PGlite(folder);
  const retry=await saveConsultationOnce(adapter(pg),key,{message:payload.message,...request,source:'consultation'},request);
  assert.equal(retry.requestId,first.requestId);assert.equal(retry.replayed,true);
 }finally{await pg.close();await rm(folder,{recursive:true,force:true});}
});
test('same key with changed content conflicts; new keys and unkeyed inquiries stay separate',async()=>{
 const pg=new PGlite();await pg.exec(ddl);
 try{
  await saveConsultationOnce(adapter(pg),key,payload,request);
  await assert.rejects(saveConsultationOnce(adapter(pg),key,{...payload,message:'Different scope'},request),ConsultationReplayConflict);
  assert.equal((await saveConsultationOnce(adapter(pg),'22222222-2222-4222-8222-222222222222',payload,request)).replayed,false);
  const a=await saveConsultationOnce(adapter(pg),null,payload,request),b=await saveConsultationOnce(adapter(pg),null,payload,request);
  assert.notEqual(a.requestId,b.requestId);
 }finally{await pg.close();}
});
test('failed request write rolls back receipt so a safe retry can persist',async()=>{
 const pg=new PGlite();await pg.exec(ddl);
 try{
  await pg.exec("ALTER TABLE consultation_requests ADD CONSTRAINT offline_failure CHECK (name <> 'Offline Fixture')");
  await assert.rejects(saveConsultationOnce(adapter(pg),key,payload,request));
  assert.equal((await pg.query<{count:number}>('SELECT count(*)::int AS count FROM submissions')).rows[0].count,0);
  await pg.exec('ALTER TABLE consultation_requests DROP CONSTRAINT offline_failure');
  assert.equal((await saveConsultationOnce(adapter(pg),key,payload,request)).replayed,false);
 }finally{await pg.close();}
});
