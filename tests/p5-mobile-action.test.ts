import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('only the final mobile estimate action is sticky and keyboard safe',()=>{
  const component=readFileSync('components/P5Estimator.tsx','utf8');
  const css=readFileSync('components/P5Estimator.module.css','utf8');
  assert.equal((component.match(/data-final-estimate-action/g)||[]).length,1);
  assert.equal((component.match(/type="file"/g)||[]).length,1);
  assert.equal((component.match(/Tell us about your project/g)||[]).length,1);
  assert.match(css,/\.actions\.finalActions\{position:sticky!important;bottom:0!important/);
  assert.match(css,/env\(safe-area-inset-bottom,0px\)/);
  assert.match(css,/\.formBody\[data-entry-focused=true\] \.actions\.finalActions\{position:static!important/);
  assert.doesNotMatch(css,/\.actions\{[^}]*position:sticky/);
  assert.match(component,/onFocusCapture=\{event=>setEntryFocused\(\(event\.target as HTMLElement\)\.matches/);
});