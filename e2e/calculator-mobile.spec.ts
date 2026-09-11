import {expect,test} from '@playwright/test';
test('typed scope reaches review and submission without repeating known details',async({page})=>{
 let draft:any=null;let submissions=0;
 const answers={service:'cabinet-install',taskList:'Install 20 linear feet of base cabinets and no uppers.',cabinetRoom:'kitchen',cabinetBaseLf:'20',cabinetUpperLf:'0',materials:'Paint-grade Shaker cabinets'};
 await page.route('**/api/p5-estimator/**',async route=>{
  const request=route.request();const endpoint=new URL(request.url()).pathname.split('/').pop();
  const send=(body:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  if(endpoint==='draft'){
   if(request.method()!=='GET')draft={...draft,...request.postDataJSON(),revision:(draft?.revision||0)+1,status:'draft',uploads:draft?.uploads||[],extraction:draft?.extraction||null};
   return send({draft});
  }
  if(endpoint==='scope'){
   const extraction={summary:'Kitchen cabinet installation',facts:Object.entries(answers).map(([field,value])=>({field,value,confidence:.98,source:'description',evidence:value})),conflicts:[],missingInformation:[],reviewNotes:[],clarifications:[]};
   draft={...draft,answers:{...draft.answers,...answers},revision:draft.revision+1,extraction};
   return send({draft,analysis:{extraction},conflicts:[],pricedFields:[]});
  }
  if(endpoint==='submit'){
   submissions++;draft={...draft,status:'submitted'};
   return send({accepted:true,result:{status:'preliminary',range:{low:1000,high:1800},categoryRanges:[],lineItems:[],summary:'Synthetic test range',includedCategories:[],allowances:[],assumptions:[],exclusions:[],factors:[],nextStep:'Schedule a scope review.',message:'Synthetic test range.',disclaimer:'Not a bid.'},delivery:[]});
  }
  return send({});
 });
 await page.goto('/estimate');const est=page.locator('[data-p5-estimator]');
 await est.getByLabel('Tell us about your project',{exact:true}).fill('Install 20 linear feet of paint-grade Shaker base cabinets in the kitchen. No upper cabinets.');
 await est.getByRole('button',{name:'Continue',exact:true}).click();
 await expect(est.getByRole('heading',{name:'Your project is ready to review',exact:true})).toBeVisible();
 await expect(est.getByRole('region',{name:'Project question'})).toHaveCount(0);
 await est.getByLabel('Your name',{exact:true}).fill('Synthetic QA');
 await est.getByLabel('Email',{exact:true}).fill('qa@example.invalid');
 await est.getByRole('checkbox').check();
 await est.getByRole('button',{name:'Get my estimate',exact:true}).click();
 await expect(est.getByText('Schedule a scope review.',{exact:true})).toBeVisible();
 expect(submissions).toBe(1);
});
