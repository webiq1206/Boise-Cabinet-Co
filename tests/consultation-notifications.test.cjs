const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../server/services/leadNotifications.ts'),'utf8');
for(const suppress of [true,false])test(`shared notifier preserves in-app behavior; admin email suppression=${suppress}`,async()=>{
 const counts={email:0,inApp:0};
 const layout=new Proxy({getAdminRecipientEmails:async()=>['owner@example.invalid']},{get:(o,k)=>k in o?o[k]:(...args)=>String(args[0]??'')});
 const modules={
  '@/lib/db':{db:{select:()=>({from:()=>({where:()=>({limit:async()=>[]})})})}},
  '@/shared/schema':{notifications:{id:'id',type:'type',leadId:'leadId'}},
  'drizzle-orm':{and:()=>null,eq:()=>null},
  '../storage':{storage:{getAllAdmins:async()=>[{id:'offline-admin'}],createNotification:async()=>counts.inApp++}},
  '../resend':{getUncachableResendClient:async()=>({fromEmail:'owner@example.invalid',client:{emails:{send:async()=>counts.email++}}})},
  './emailLayout':layout,
 };
 const context={exports:{},require:n=>{assert.ok(n in modules,n);return modules[n]},process:{env:{}},console:{error(){}}};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 await context.exports.notifyNewLead({leadId:'offline',name:'Fixture',phone:null,email:'fixture@example.invalid',projectType:'built-ins',city:null,message:null},suppress?{sendAdminEmail:false}:undefined);
 assert.equal(counts.inApp,1);assert.equal(counts.email,suppress?0:1);
});
