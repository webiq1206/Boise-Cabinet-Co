import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {processingLookup} from '../lib/p5/backgroundJobs.ts';
import {reconcileScope,scopeQuestions} from '../lib/p5/adaptive.ts';
import {applyCabinetIntent,cabinetIntent} from '../lib/p5/projectIntent.ts';
import {scopeAnalysisFailureWarning} from '../lib/p5/scopeEndpoint.ts';
import {analysisAcknowledgement} from '../lib/p5/processingStatus.ts';
import type {ScopeExtraction} from '../lib/p5/scope.ts';

const text='QA TEST ONLY: Install 20 linear feet of owner-supplied assembled base cabinets in Caldwell. Labor only; exclude countertops and upper cabinets.';
const services=['cabinet-product','cabinet-install'];

test('completed work progress binds each work key as scalar text',()=>{
  const keys=['analysis:v8:abc','analysis:document-service-v1:def'];
  const lookup=processingLookup(keys);
  assert.doesNotMatch(lookup.statement,/ANY|text\[\]/);
  assert.match(lookup.statement,/work_key IN \(\$2,\$3\)/);
  assert.deepEqual(lookup.values,keys);
  assert.deepEqual(processingLookup([keys[0]]).values,[keys[0],keys[0]]);
});

test('owner-supplied labor-only cabinet installation is installation work',()=>{
  assert.equal(cabinetIntent(text,services),'cabinet-install');
  assert.equal(cabinetIntent('Supply cabinets only; do not install them.',services),'cabinet-product');
  assert.equal(cabinetIntent('The owner-supplied cabinets are stored on site.',services),undefined);
  const component=readFileSync(new URL('../components/P5Estimator.tsx',import.meta.url),'utf8');
  assert.match(component,/'cabinet-install':'Cabinet installation'/);
  assert.doesNotMatch(component,/'cabinet-install':'Cabinets with installation'/);
});

test('the reproduced typed scope returns captured details without asking project type',()=>{
  const visitor=applyCabinetIntent(text,services,{}).answers;
  const extraction:ScopeExtraction={
    summary:'Labor-only install of 20 LF owner-supplied base cabinets in Caldwell.',
    facts:[
      {field:'service',value:'cabinet-install',confidence:.9,source:'typed scope',evidence:'Install owner-supplied cabinets',basis:'stated'},
      {field:'location',value:'Caldwell',confidence:.9,source:'typed scope',evidence:'in Caldwell',basis:'stated'},
      {field:'cabinetBaseLf',value:'20',confidence:.95,source:'typed scope',evidence:'20 linear feet',basis:'stated'},
      {field:'installation',value:'Labor-only installation of owner-supplied base cabinets',confidence:.9,source:'typed scope',evidence:'Labor only',basis:'stated'},
      {field:'ownerSupplied',value:'Owner-supplied assembled base cabinets',confidence:.9,source:'typed scope',evidence:'owner-supplied assembled base cabinets',basis:'stated'},
      {field:'exclusions',value:'Countertops and upper cabinets excluded',confidence:.95,source:'typed scope',evidence:'exclude countertops and upper cabinets',basis:'stated'},
    ],
    conflicts:[],missingInformation:[],reviewNotes:[],clarifications:[],
  };
  const applied=applyCabinetIntent(text,services,visitor,extraction);
  const merged=reconcileScope(applied.answers,applied.extraction!);
  assert.deepEqual(
    Object.fromEntries(['service','location','cabinetBaseLf','installation','ownerSupplied','exclusions'].map(key=>[key,merged.answers[key as keyof typeof merged.answers]])),
    {service:'cabinet-install',location:'Caldwell',cabinetBaseLf:'20',installation:'Labor-only installation of owner-supplied base cabinets',ownerSupplied:'Owner-supplied assembled base cabinets',exclusions:'Countertops and upper cabinets excluded'},
  );
  assert.ok(!scopeQuestions(merged.answers,applied.extraction,merged.conflicts,[],[],text).some(question=>question.field==='service'));
});

test('text-only failures never claim that files need review',()=>{
  const textWarning=scopeAnalysisFailureWarning(false);
  assert.doesNotMatch(textWarning,/\bfiles?|documents?\b/i);
  assert.match(textWarning,/project description is saved/i);
  const acknowledgement=analysisAcknowledgement(1,0,true,1);
  assert.doesNotMatch(acknowledgement,/\bfiles?\b/i);
  assert.match(acknowledgement,/text is saved/i);
  assert.match(scopeAnalysisFailureWarning(true),/files are saved/i);
});