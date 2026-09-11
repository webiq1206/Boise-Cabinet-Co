/** Legacy pricing retirement gate. Financial calculation coverage lives in p5-pricing and estimate-engine tests. */
import assert from 'node:assert/strict';
import {NextRequest} from 'next/server';
import {getDefaultSelectionsForProject,EMPTY_SELECTIONS,type EstimateSelections} from '../../shared/estimateEngine';
import {POST} from '../../app/api/estimate/calculate/route';
const FIXTURES: Array<{ name: string; rooms: EstimateSelections[] }> = [
  { name: "kitchen defaults", rooms: [getDefaultSelectionsForProject("kitchen")] },
  {
    name: "kitchen + bathroom + pantry",
    rooms: [
      getDefaultSelectionsForProject("kitchen"),
      getDefaultSelectionsForProject("bathroom"),
      getDefaultSelectionsForProject("pantry"),
    ],
  },
  {
    name: "fully upgraded kitchen",
    rooms: [
      {
        ...EMPTY_SELECTIONS,
        project: "kitchen",
        layout: "island",
        size: 60,
        sizeUpper: 50,
        doorStyle: "beta-shaker",
        finishCategory: "gloss",
        finishTier: "reserve",
        construction: "best",
      },
    ],
  },
  {
    name: "partial selections (size only)",
    rooms: [{ ...EMPTY_SELECTIONS, project: "laundry", size: 12, sizeUpper: 8 }],
  },
  {
    name: "mixed priceable + unpriceable rooms",
    rooms: [getDefaultSelectionsForProject("built-ins"), EMPTY_SELECTIONS],
  },
  {
    name: "out-of-range sizes (engine clamps both paths identically)",
    rooms: [{ ...getDefaultSelectionsForProject("kitchen"), size: 500, sizeUpper: 500 }],
  },
];

async function main(){
for(const fixture of FIXTURES){
 const response=await POST(new NextRequest('http://localhost/api/estimate/calculate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rooms:fixture.rooms,contact:{name:'Fixture',email:'fixture@example.invalid'}})}));
 const data=await response.json();assert.equal(response.status,410,fixture.name);assert.equal(data.nextStep,'/estimate');assert.ok(!('combined' in data)&&!('priceLow' in data)&&!('record' in data),'No second pricing engine is publicly exposed');
}
console.log('Every legacy pricing fixture routes to the reviewed-scope estimator without exposing legacy prices.');

}
main().catch(error=>{console.error(error);process.exitCode=1;});
