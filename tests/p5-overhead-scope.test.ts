import test from 'node:test';
import assert from 'node:assert/strict';
import {customerSafeText} from '../lib/p5/presentation.ts';
test('customer scope keeps overhead cabinets and lighting while removing financial overhead',()=>{
 for(const text of ['Install overhead cabinets above the workbench.','Replace overhead lighting in the pantry.'])assert.equal(customerSafeText(text),text);
 for(const text of ['Overhead recovery: $400.','Overhead is 20%.','Add $400 for overhead.'])assert.equal(customerSafeText(text),'');
});
