import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';

const databaseNames=['DATABASE_URL','PGDATABASE_URL','REPLIT_DB_URL'] as const;
const previous=Object.fromEntries(databaseNames.map(name=>[name,process.env[name]]));
for(const name of databaseNames)delete process.env[name];
const pg=new PGlite();
try{
  const executor=drizzle(pg);
  const {queryWithExecutor}=await import('../lib/p5/database.ts');
  const {processingLookup}=await import('../lib/p5/backgroundJobs.ts');
  await queryWithExecutor(executor,`CREATE TABLE p5_estimator_work(
    draft_id text NOT NULL,
    work_key text NOT NULL,
    payload jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(draft_id,work_key)
  )`);
  const draft='isolated-progress-adapter';
  const local='analysis:v8:isolated-local';
  const remote='analysis:document-service-v1:isolated-remote';
  await queryWithExecutor(
    executor,
    'INSERT INTO p5_estimator_work(draft_id,work_key,payload,updated_at) VALUES($1,$2,$3::jsonb,$4),($1,$5,$6::jsonb,$7)',
    [
      draft,
      local,
      JSON.stringify({processing:{phase:'reading',message:'Local result'}}),
      new Date('2026-09-19T00:00:00Z'),
      remote,
      JSON.stringify({processing:{phase:'reading',message:'Remote result'}}),
      new Date('2026-09-19T00:01:00Z'),
    ],
  );
  const lookup=processingLookup([local,remote]);
  const rows=await queryWithExecutor(executor,lookup.statement,[draft,...lookup.values]);
  assert.equal(rows.length,1);
  assert.equal(rows[0].processing.message,'Remote result');
  const single=processingLookup([local]);
  const one=await queryWithExecutor(executor,single.statement,[draft,...single.values]);
  assert.equal(one.length,1);
  assert.equal(one[0].processing.message,'Local result');
  console.log('PASS: repaired progress lookup binds scalar work keys through the production database adapter against isolated PGlite.');
}finally{
  await pg.close();
  for(const name of databaseNames){
    if(previous[name]===undefined)delete process.env[name];
    else process.env[name]=previous[name];
  }
}