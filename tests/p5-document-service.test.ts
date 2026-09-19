import {test} from 'node:test';
import assert from 'node:assert/strict';
import {documentServiceEligible,documentServiceHeaders,remoteDocumentId} from '../lib/p5/documentServiceClient.ts';
import {analysisProgressWorkKeys,partitionDocumentUploads} from '../lib/p5/analysisWork.ts';
import {combineScopeExtractions,SCOPE_PLAN_PAGE_LIMIT,SCOPE_PLAN_PAGE_TARGET,SCOPE_UPLOAD_HELP} from '../lib/p5/scope.ts';
const pdf:any={id:'file',name:'scope.pdf',type:'application/pdf',size:1000,sha256:'a'.repeat(64),status:'stored'};
test('shared service is off by default and never changes legacy mixed-format inputs',()=>{
 assert.equal(documentServiceEligible([pdf],{}),false);
 assert.equal(documentServiceEligible([pdf],{P5_DOCUMENT_SERVICE_MODE:'remote'}),true);
  assert.equal(documentServiceEligible([pdf,{...pdf,type:'image/png'}],{P5_DOCUMENT_SERVICE_MODE:'remote'}),false);
 assert.equal(documentServiceEligible([{...pdf,size:60*1024*1024}],{P5_DOCUMENT_SERVICE_MODE:'remote'}),false);
 assert.equal(documentServiceEligible([{...pdf,size:0}],{P5_DOCUMENT_SERVICE_MODE:'remote'}),false);
 assert.throws(()=>documentServiceEligible([pdf],{P5_DOCUMENT_SERVICE_MODE:'remote',P5_DOCUMENT_SERVICE_MAX_BYTES:'invalid'}),/configuration/);
});
test('mixed scopes partition eligible PDFs without dropping local inputs',()=>{
  const photo={...pdf,id:'photo',name:'elevation.png',type:'image/png'};
  const sheet={...pdf,id:'sheet',name:'cabinet.xlsx',type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
  const plan={...pdf,id:'plan',name:'plan.pdf'};
  const parts=partitionDocumentUploads([plan,photo,sheet],{P5_DOCUMENT_SERVICE_MODE:'remote'});
  assert.deepEqual(parts.remote.map(file=>file.id),['plan']);
  assert.deepEqual(parts.local.map(file=>file.id),['photo','sheet']);
  assert.equal(parts.remote.length+parts.local.length,3);
});
test('remote partition keeps oversized PDFs on the local resumable route',()=>{
  const oversized={...pdf,id:'oversized',size:60*1024*1024};
  const parts=partitionDocumentUploads([pdf,oversized],{P5_DOCUMENT_SERVICE_MODE:'remote'});
  assert.deepEqual(parts.remote.map(file=>file.id),['file']);
  assert.deepEqual(parts.local.map(file=>file.id),[oversized.id]);
});
test('text-only scopes stay local and mixed progress follows both independent work keys',()=>{
  const draft:any={id:'draft',uploads:[]};
  assert.match(analysisProgressWorkKeys(draft,'typed scope',{}, {P5_DOCUMENT_SERVICE_MODE:'remote'})[0],/^analysis:v8:/);
  const photo={...pdf,id:'photo',name:'elevation.png',type:'image/png'};
  draft.uploads=[pdf,photo];
  const keys=analysisProgressWorkKeys(draft,'typed scope',{}, {P5_DOCUMENT_SERVICE_MODE:'remote'});
  assert.equal(keys.length,2);assert.match(keys[0],/^analysis:document-service-v1:/);assert.match(keys[1],/^analysis:v8:/);assert.notEqual(keys[0],keys[1]);
});
test('mixed route reconciliation retains quantities, responsibilities, conflicts and page coverage',()=>{
  const instructions={inclusions:['Install cabinets'],exclusions:['Plumbing'],responsibilities:['Owner supplies cabinets'],buildings:[],floors:[],separateBuildings:false,laborOnly:false,materialsOnly:false,questions:[]};
  const remote:any={summary:'Plans',facts:[{field:'cabinetBaseLf',value:'20',confidence:.99,source:'plan.pdf',evidence:'20 LF base cabinets',basis:'stated'}],conflicts:[],missingInformation:[],reviewNotes:[],instructions,documentCoverage:{expectedPages:2,complete:true,pages:[1,2].map(page=>({source:'plan.pdf',page,status:'read',notes:[]}))},takeoffs:[]};
  const local:any={summary:'Photo and schedule',facts:[{field:'cabinetUpperLf',value:'10',confidence:.98,source:'schedule.xlsx',evidence:'10 LF uppers',basis:'stated'}],conflicts:[{field:'materials',values:['paint grade','stain grade'],explanation:'Sources differ'}],missingInformation:[],reviewNotes:['photo.png: finish needs confirmation.'],instructions:{...instructions,inclusions:['Install upper cabinets'],responsibilities:['Owner supplies hardware']},documentCoverage:{expectedPages:1,complete:true,pages:[{source:'photo.png',page:1,status:'read',notes:[]}]},takeoffs:[]};
  const merged=combineScopeExtractions([remote,local]);
  assert.deepEqual(merged.facts.map(f=>[f.field,f.value,f.source]),[['cabinetBaseLf','20','plan.pdf'],['cabinetUpperLf','10','schedule.xlsx']]);
  assert.equal(merged.conflicts.length,1);assert.deepEqual(merged.instructions?.exclusions,['Plumbing']);
  assert.deepEqual(merged.instructions?.responsibilities.sort(),['Owner supplies cabinets','Owner supplies hardware']);
  assert.equal(merged.documentCoverage?.expectedPages,3);assert.equal(merged.documentCoverage?.complete,true);
  assert.match(merged.reviewNotes.join(' '),/finish needs confirmation/);
});
test('the advertised plan envelope is 250 pages without weakening parser safety',()=>{
  assert.equal(SCOPE_PLAN_PAGE_LIMIT,250);
  assert.equal(SCOPE_PLAN_PAGE_TARGET,250);
  assert.match(SCOPE_UPLOAD_HELP,/250 MiB each/);
  assert.match(SCOPE_UPLOAD_HELP,/plans up to 250 pages/);
});
test('cross-site and cross-project source identities cannot collide',()=>{
 assert.notEqual(remoteDocumentId('p5homeco.com','one',pdf.sha256),remoteDocumentId('boiseconstruction.co','one',pdf.sha256));
 assert.notEqual(remoteDocumentId('p5homeco.com','one',pdf.sha256),remoteDocumentId('p5homeco.com','two',pdf.sha256));
});
test('signed source requests bind body, method and path',()=>{
 const a=documentServiceHeaders('POST','/v1/projects/one/documents','p5homeco.com','test-secret',Buffer.from('pdf'),1700000000000,'test-nonce');
 const b=documentServiceHeaders('POST','/v1/projects/two/documents','p5homeco.com','test-secret',Buffer.from('pdf'),1700000000000,'test-nonce');
 assert.notEqual(a['x-p5-signature'],b['x-p5-signature']);
 assert.equal(a['x-p5-body-sha256'].length,64);
});
