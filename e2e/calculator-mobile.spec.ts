import {expect,test} from '@playwright/test';
// The review intake separates the whole-project confirmation from the customer confirmation.
const SCOPE_REVIEW_LABEL='I checked the whole project type, supporting work and exclusions against this description.';
const INTAKE_CONFIRM_LABEL='These details reflect my project. I understand the team will review them before preparing an estimate.';
test('typed scope reaches review and a saved request without repeating known details',async({page})=>{
 let draft:any=null;let submissions=0;let receipt:any=null;const asked:string[]=[];
 const answers={service:'cabinet-install',taskList:'Install 20 linear feet of base cabinets and no uppers.',cabinetRoom:'kitchen',cabinetBaseLf:'20',cabinetUpperLf:'0',materials:'Paint-grade Shaker cabinets'};
 await page.route('**/api/p5-estimator/**',async route=>{
  const request=route.request();const endpoint=new URL(request.url()).pathname.split('/').pop();
  const send=(body:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(endpoint==='draft'){
   if(request.method()!=='GET'){
    const input=request.postDataJSON();const id=request.headers()['x-p5-draft-id']||draft?.id;
    // The server derives the intake identity from its own saved state (lib/p5/intakeDraft.ts).
    const intake={desiredOutcome:'',workContext:'',budget:'',supportingServices:[],transcript:[],...(draft?.intake||{}),...(input.intake||{}),projectId:draft?.intake?.projectId||`cabinet:${id}`,originSite:'cabinet',currentSite:'cabinet',version:draft?.revision||0,contact:{...(input.contact||{}),preferredContact:input.intake?.contact?.preferredContact||'either'}};
    draft={...draft,...input,revision:(draft?.revision||0)+1,status:'draft',uploads:draft?.uploads||[],extraction:draft?.extraction||null,intake};
   }
   return send({draft});
  }
  if(endpoint==='scope'){
   const extraction={summary:'Kitchen cabinet installation',facts:Object.entries(answers).map(([field,value])=>({field,value,confidence:.98,source:'description',evidence:value})),conflicts:[],missingInformation:[],reviewNotes:[],clarifications:[]};
   draft={...draft,answers:{...draft.answers,...answers},revision:draft.revision+1,extraction};
   return send({draft,analysis:{extraction},conflicts:[],pricedFields:[]});
  }
  if(endpoint==='intake'){
   if(request.method()==='GET')return send({receipt});
   const body=request.postDataJSON();
   if(body.revision!==draft.revision||body.confirmed!==true)return send({error:'Review and confirm the latest project details before sending.'},409);
   submissions++;
   receipt={accepted:true,projectId:draft.intake.projectId,reference:'P5-SYNTHETIC1',revision:draft.revision,team:{primaryTeam:'cabinet',teamName:'Boise Cabinet Co',supportingServices:[],handoff:null,unresolved:[]},unresolved:['Synthetic detail left for the team.'],savedAt:new Date().toISOString(),delivery:{customer:'blocked',team:'blocked',crm:'blocked'},deliveryDetails:{customer:'Simulated; no delivery.',team:'Simulated; no delivery.',crm:''}};
   return send(receipt);
  }
  return send({});
 });
 await page.goto('/estimate');const est=page.locator('[data-p5-estimator]');
 await est.getByLabel('Tell us about your project',{exact:true}).fill('Install 20 linear feet of paint-grade Shaker base cabinets in the kitchen. No upper cabinets.');
 await est.getByRole('button',{name:'Send message',exact:true}).click();
 // Only the optional location and timing questions may follow a fully described scope; a
 // suggested answer or Not sure yet answers each. Known cabinet details are never asked again.
 const review=est.getByRole('heading',{name:'Review your project',exact:true});
 for(let i=0;i<6;i++){
  const q=est.locator('section[aria-label="Project question"]');await review.or(q).first().waitFor({timeout:30000});if(await review.count())break;
  asked.push((await q.innerText()).slice(0,200));
  const chips=q.locator('[aria-label="Suggested answers"] button');const unsure=q.getByRole('button',{name:'Not sure yet',exact:true});
  if(await chips.count()){await chips.first().click();await est.getByRole('button',{name:'Send answer',exact:true}).click();}else if(await unsure.count())await unsure.click();else throw new Error('Unexpected question: '+asked.at(-1));
  await page.waitForFunction(()=>!document.querySelector('[data-p5-estimator][aria-busy=true]'));
 }
 await expect(review).toBeVisible();
 expect(asked.filter(text=>/cabinet|linear feet|upper/i.test(text))).toEqual([]);
 await expect(est.getByRole('region',{name:'Project question'})).toHaveCount(0);
 await est.getByLabel('Your name',{exact:true}).fill('Synthetic QA');
 await est.getByLabel(/^Email/).fill('qa@example.invalid');
 await est.getByLabel(SCOPE_REVIEW_LABEL,{exact:true}).check();
 await est.getByLabel(INTAKE_CONFIRM_LABEL,{exact:true}).check();
 await est.getByRole('button',{name:'Send project request',exact:true}).click();
 await expect(est.getByRole('heading',{name:'Your project request is saved',exact:true})).toBeVisible();
 await expect(est.getByText('Boise Cabinet Co',{exact:false}).first()).toBeVisible();
 expect(await est.innerText()).not.toMatch(/\$\s?\d/);
 expect(submissions).toBe(1);
});
