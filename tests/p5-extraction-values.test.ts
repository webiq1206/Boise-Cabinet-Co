import test from "node:test";
import assert from "node:assert/strict";
import {validateAnswer,validateExtraction,combineScopeExtractions} from "../lib/p5/scope.ts";
test("malformed numeric extraction cannot become a zero or a clarification option",()=>{
 for(const value of [",","1,,000","0x50","Infinity","80 feet"]){assert.ok(validateAnswer("sqft",value));}
 const fact=(value:string)=>({field:"sqft",value,confidence:.98,source:"scope.pdf",evidence:"Room area 80 square feet",basis:"stated"});
 const result=validateExtraction({summary:"Test scope",facts:[fact(","),fact("80.0")],conflicts:[],missingInformation:[],reviewNotes:[]});
 assert.equal(result.facts.length,1);assert.equal(result.facts[0].value,"80");
 assert.equal(result.conflicts.length,0);
 const other=validateExtraction({summary:"Same scope image",facts:[fact("80")],conflicts:[],missingInformation:[],reviewNotes:[]});
 assert.equal(combineScopeExtractions([result,other]).conflicts.length,0);
});
test("separate trade hours remain additive takeoffs while repeated totals and page mentions are not charged twice",()=>{
 const source=(page:number)=>({source:"driveway.pdf",page,sheet:`P${page}`,revision:"1"});
 const takeoff=(id:string,component:string,quantity:number,page:number,description=`${component} labor`)=>({id,description,building:"Main",floor:"Site",component,quantity,unit:"hours",basis:"stated",evidence:`${quantity} ${component} labor hours`,sources:[source(page)],supersedes:[],issues:[]});
 const excavation=takeoff("excavation-hours","excavation",16,1);
 const concrete=takeoff("concrete-hours","concrete",24,2);
 const repeated={...excavation,id:"excavation-hours-repeat",sources:[source(2)],duplicateOf:"excavation-hours"};
 const total={...takeoff("labor-total","all driveway trades",40,2,"Labor total"),aggregateOf:["excavation-hours","concrete-hours"]};
 const facts=[16,24].map((value,index)=>({field:"laborHours",value:String(value),confidence:.99,source:"driveway.pdf",evidence:index?"24 concrete labor hours":"16 excavation labor hours",basis:"stated"}));
 const result=validateExtraction({summary:"Two-page driveway",facts,conflicts:[],missingInformation:[],reviewNotes:[],pages:[1,2].map(page=>({...source(page),status:"read",notes:[]})),takeoffs:[excavation,repeated,concrete,total]});
 assert.equal(result.conflicts.some(conflict=>conflict.field==="laborHours"),false);
 assert.equal(result.facts.some(fact=>fact.field==="laborHours"),false);
 assert.equal(result.takeoffs?.length,2);
 assert.deepEqual(result.takeoffs?.map(item=>[item.component,item.quantity]),[["excavation",16],["concrete",24]]);
 assert.equal(result.takeoffs?.reduce((sum,item)=>sum+(item.quantity||0),0),40);
 assert.deepEqual(result.takeoffs?.find(item=>item.component==="excavation")?.sources.map(item=>item.page),[1,2]);
});
