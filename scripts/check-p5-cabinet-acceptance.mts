import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {query} from '../lib/p5/database';
import {ESTIMATOR_BRAND as brand} from '../lib/p5/brand';
import {planningCatalogFingerprint,verifyCabinetAlternateCatalog} from '../lib/p5/catalogAcceptance';

const live=process.argv.includes('--live');
const dispatch=process.argv.includes('--dispatch');
const verifyAnalysis=process.argv.includes('--verify-analysis');
const confirmed=process.argv.includes('--confirm-production');
if(live&&!confirmed)throw new Error('Live acceptance requires --confirm-production.');
if(live&&(dispatch===verifyAnalysis))throw new Error('Live acceptance requires exactly one action: --verify-analysis or --dispatch.');
if(live&&dispatch&&process.env.P5_ACCEPTANCE_RECEIVER_CONTRACT_VERIFIED!=='true')
  throw new Error('Live dispatch is blocked until the durable source-scoped keyed receiver contract has been tested and P5_ACCEPTANCE_RECEIVER_CONTRACT_VERIFIED=true is set.');
let liveCredentials:{base:string;draftId:string;draftKey:string;revision:number;adminCookie:string;sourceFingerprint:string}|undefined;
if(live){
  for(const key of ['P5_ACCEPTANCE_BASE_URL','P5_ACCEPTANCE_DRAFT_ID','P5_ACCEPTANCE_DRAFT_KEY','P5_ACCEPTANCE_DRAFT_REVISION','P5_ACCEPTANCE_ADMIN_COOKIE','P5_ACCEPTANCE_SOURCE_FINGERPRINT'])
    if(!process.env[key]?.trim())throw new Error(`Missing authenticated acceptance credential: ${key}`);
  assert.match(process.env.P5_ACCEPTANCE_DRAFT_ID!,/^[a-f0-9-]{36}$/i);
  assert.match(process.env.P5_ACCEPTANCE_DRAFT_KEY!,/^[a-f0-9]{64}$/i);
  assert.match(process.env.P5_ACCEPTANCE_SOURCE_FINGERPRINT!,/^[a-f0-9]{64}$/i);
  assert.ok(/^\d+$/.test(process.env.P5_ACCEPTANCE_DRAFT_REVISION!),'Draft revision must be exact.');
  liveCredentials={base:process.env.P5_ACCEPTANCE_BASE_URL!.replace(/\/+$/,''),draftId:process.env.P5_ACCEPTANCE_DRAFT_ID!,draftKey:process.env.P5_ACCEPTANCE_DRAFT_KEY!,revision:Number(process.env.P5_ACCEPTANCE_DRAFT_REVISION!),adminCookie:process.env.P5_ACCEPTANCE_ADMIN_COOKIE!,sourceFingerprint:process.env.P5_ACCEPTANCE_SOURCE_FINGERPRINT!};
}

async function main(){
  const catalogFile=process.env.P5_ACCEPTANCE_CATALOG_FILE?.trim();
  const catalog=catalogFile?JSON.parse(await readFile(catalogFile,'utf8')):(await query("SELECT payload FROM p5_estimator_policy WHERE id='current'"))[0]?.payload?.planningCatalog;
  assert.ok(catalog,'The current approved planning catalog is required.');
  const report=verifyCabinetAlternateCatalog(catalog);
  const fingerprint=planningCatalogFingerprint(catalog);
  if(!liveCredentials){
    console.log(JSON.stringify({mode:'preflight',brand:brand.id,crmUrl:brand.crmUrl,catalogFingerprint:fingerprint,...report,providerCalls:0,emailWrites:0,crmWrites:0,dbWrites:0},null,2));
    return;
  }
  const {base,draftId,draftKey,revision,adminCookie,sourceFingerprint}=liveCredentials;
  const draftHeaders={'x-p5-draft-id':draftId,'x-p5-draft-key':draftKey};
  const getDraft=async()=>{const response=await fetch(`${base}/api/p5-estimator/draft`,{headers:draftHeaders});if(!response.ok)throw new Error(`Draft read failed HTTP ${response.status}`);return await response.json() as any;};
  const initial=await getDraft();
  const draft=initial.draft||initial;
  if(Number(draft.revision)!==revision)throw new Error('Draft revision changed; refresh the authenticated acceptance record instead of overwriting it.');
  const actualFingerprint=createHash('sha256').update(JSON.stringify([String(draft.text||''),(draft.uploads||[]).map((file:any)=>[file.id,file.sha256])])).digest('hex');
  if(actualFingerprint!==sourceFingerprint)throw new Error('Draft source or upload identity changed; do not run acceptance on this record.');
  if(verifyAnalysis){
    const inspected=await fetch(`${base}/api/admin/p5-estimators?id=${encodeURIComponent(draftId)}&analysisReuse=true`,{headers:{cookie:adminCookie}});
    const reuse=await inspected.json() as any;
    if(!inspected.ok)throw new Error(`Authenticated reuse inspection failed HTTP ${inspected.status}`);
    if(Number(reuse.revision)!==revision||reuse.sourceFingerprint!==sourceFingerprint)throw new Error('Authenticated admin inspection did not match the exact draft revision and source.');
    if(!reuse.reusable)throw new Error(`Completed analysis is not safely reusable: ${reuse.reason||'unknown reason'}. No provider work or draft write was started.`);
    console.log(JSON.stringify({mode:'verify-analysis',brand:brand.id,draftId,sourceFingerprint,revision,provider:reuse.provider,model:reuse.model,analyzedAt:reuse.analyzedAt,catalogFingerprint:fingerprint,...report,providerCalls:0,emailWrites:0,crmWrites:0,dbWrites:0},null,2));
    return;
  }
  if(!draft.reviewed)throw new Error('The authenticated draft is not reviewed; a human must confirm scope before live pricing.');
  const submit=async()=>fetch(`${base}/api/p5-estimator/submit`,{method:'POST',headers:{...draftHeaders,'content-type':'application/json'},body:JSON.stringify({revision:currentRevision,background:true,retry:false})});
  const currentRevision=revision;
  let submission=await submit(),submissionBody=await submission.json() as any;
  if(submission.status===202&&submissionBody.pending){throw new Error('Pricing is still pending; rerun with the same credentials after the durable job completes.');}
  if(!submission.ok&&!submissionBody.accepted&&!submissionBody.duplicate)throw new Error(`Authenticated submission failed HTTP ${submission.status}`);
  const pdf=await fetch(`${base}/api/p5-estimator/pdf`,{headers:draftHeaders});if(!pdf.ok)throw new Error(`Customer PDF failed HTTP ${pdf.status}`);
  const adminPdf=await fetch(`${base}/api/admin/p5-estimators?id=${encodeURIComponent(draftId)}&pdf=administrative`,{headers:{cookie:adminCookie}});
  if(!adminPdf.ok)throw new Error(`Administrative PDF failed HTTP ${adminPdf.status}`);
  const delivery=await fetch(`${base}/api/admin/p5-estimators`,{method:'POST',headers:{cookie:adminCookie,'content-type':'application/json'},body:JSON.stringify({action:'process-delivery',id:draftId,revision:currentRevision})});
  if(!delivery.ok)throw new Error(`Delivery processing failed HTTP ${delivery.status}`);
  console.log(JSON.stringify({mode:'live',brand:brand.id,crmUrl:brand.crmUrl,draftId,revision:currentRevision,submission:submissionBody.accepted?'accepted':submissionBody.duplicate?'duplicate':'pending',customerPdf:true,administrativePdf:true,delivery:await delivery.json(),catalogFingerprint:fingerprint,...report},null,2));
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Cabinet acceptance preflight failed');process.exit(1);});