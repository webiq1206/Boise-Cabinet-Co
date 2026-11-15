import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeWizardState} from '../lib/estimate/wizardPersistence.ts';
import {getDefaultSelectionsForProject,isPriceable} from '../shared/estimateEngine.ts';

test('recover public selections without restoring private or retired fields',()=>{
 const room=getDefaultSelectionsForProject('kitchen');
 const decoded=decodeWizardState({rooms:[{...room,construction:'better',unitCost:345,finance:{debug:true},priceLow:1}],currentIndex:3});
 assert.deepEqual(decoded,{rooms:[room],currentIndex:3});
 assert.equal(JSON.stringify(decoded).includes('unitCost'),false);
 assert.equal(decoded!.rooms.some(isPriceable),true);
});
test('malformed saved rows cannot crash the next calculation or erase other valid rooms',()=>{
 const room=getDefaultSelectionsForProject('bathroom');
 assert.equal(decodeWizardState({rooms:[null],currentIndex:0}),null);
 const decoded=decodeWizardState({rooms:[null,{project:'private-book-code'},room],currentIndex:-3});
 assert.deepEqual(decoded,{rooms:[room],currentIndex:0});
 assert.equal(decodeWizardState({rooms:[room],currentIndex:Infinity}),null);
 assert.equal(decodeWizardState({rooms:'bad',currentIndex:1}),null);
 assert.equal(decodeWizardState(null),null);
});
test('saved state keeps bounded room lists and incomplete intentional choices',()=>{
 const partial={...getDefaultSelectionsForProject('kitchen'),size:null,sizeUpper:null};
 assert.deepEqual(decodeWizardState({rooms:[partial],currentIndex:1}),{rooms:[partial],currentIndex:1});
 assert.equal(decodeWizardState({rooms:Array.from({length:20},()=>partial),currentIndex:999})!.rooms.length,10);
 assert.equal(decodeWizardState({rooms:[],currentIndex:0})!.rooms.length,0);
});
