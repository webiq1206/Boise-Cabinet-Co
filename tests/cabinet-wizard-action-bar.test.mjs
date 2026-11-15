import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createPageClearanceRegistry} from '../lib/estimate/pageClearance.ts';

function actionBar(initialValue="",initialPriority=""){
 let index=0,pending=[],slots=[],dependencies=[],cleanups=[],keyboard=0,primaryCalls=0;
 const body={},observers=[],resizeObservers=[],styleEvents=[];
 const values=new Map(initialValue?[['--wizard-bar-clearance',{value:initialValue,priority:initialPriority}]]:[]);
 const style={getPropertyValue:key=>values.get(key)?.value??'',getPropertyPriority:key=>values.get(key)?.priority??'',setProperty(key,value,priority=''){values.set(key,{value,priority});styleEvents.push({action:'set',key,value,priority});},removeProperty(key){values.delete(key);styleEvents.push({action:'remove',key});}};
 const registry=createPageClearanceRegistry(style,()=>style.getPropertyValue('--wizard-bar-clearance'));

 const jsx=(type,props)=>{
  if(props?.ref){const node={kind:props["data-wizard-action-bar-spacer"]!==undefined?"spacer":"bar",getBoundingClientRect:()=>({height:85}),closest:()=>({}),parentElement:{}};props.ref.current=node;}
  return{type,props:props??{}};
 };
 const react={useRef(value){const i=index++;return slots[i]??={current:value};},useState(value){const i=index++;if(!(i in slots))slots[i]=value;return[slots[i],next=>{slots[i]=typeof next==='function'?next(slots[i]):next;}];},useEffect(effect,deps){const i=index++;const before=dependencies[i];if(!before||deps.some((value,j)=>value!==before[j]))pending.push({i,effect});dependencies[i]=deps;}};
 const exports={};
 const source=readFileSync('components/estimate/wizard/WizardActionBar.tsx','utf8');
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require(name){
  if(name==='react')return react;if(name==='react/jsx-runtime')return{jsx,jsxs:jsx,Fragment:'fragment'};if(name==='react-dom')return{createPortal:(children,container)=>({type:'portal',props:{children,container}})};
  if(name==='lucide-react')return{ArrowLeft:'icon',ArrowRight:'icon',Loader2:'icon'};if(name==='@/lib/utils')return{cn:(...values)=>values.filter(Boolean).join(' ')};if(name==='@/components/ui/button')return{Button:'button'};if(name==='@/lib/mobileNavBar')return{requestHideMobileNavBar:()=>()=>{}};if(name==='@/lib/estimate/pageClearance')return{reservePageClearance:()=>registry.reserve()};if(name==='./useKeyboardInset')return{useKeyboardInset:()=>keyboard};throw new Error('Unexpected dependency '+name);
 },document:{body,documentElement:{style}},IntersectionObserver:class{constructor(callback,options){this.callback=callback;this.options=options;observers.push(this);}observe(node){this.node=node;}disconnect(){this.disconnected=true;}},ResizeObserver:class{constructor(){resizeObservers.push(this);}observe(node){this.node=node;}disconnect(){this.disconnected=true;}}});
 return{render(props={}){index=0;return exports.WizardActionBar({onPrimary:()=>{primaryCalls++;},primaryLabel:'Send my request',primaryTestId:'primary-action',pinned:true,dockWhenFormInView:true,ownsBottomEdge:false,...props});},flush(){for(const {i,effect}of pending.splice(0)){cleanups[i]?.();cleanups[i]=effect();}},observers,resizeObservers,style,styleEvents,reserveOther:()=>registry.reserve(),unmount(){for(const cleanup of cleanups.slice().reverse())cleanup?.();},setKeyboard(value){keyboard=value;},get primaryCalls(){return primaryCalls;}};
}
function elements(node){if(!node||typeof node!=='object')return[];return[node,...[node.props?.children].flat(Infinity).flatMap(elements)];}
function layout(tree,retainedSpacerHeight=85){
 const nodes=elements(tree);const spacer=nodes.find(node=>'data-wizard-action-bar-spacer'in node.props);const portal=nodes.find(node=>node.type==='portal');const bar=nodes.find(node=>'data-wizard-action-bar'in node.props);const buttons=nodes.filter(node=>node.props['data-testid']==='primary-action');
 // Real quote form uses space-y-4. CSS height transitions can retain the old
 // spacer height for a frame; native hidden removes both its box and its gap.
 const spacerFlow=spacer&&!spacer.props.hidden?retainedSpacerHeight+16:0;
 const barFlow=bar.props["data-wizard-action-bar-docked"]==="true"?0:85+16;
 return{spacer,portal,bar,buttons,flow:spacerFlow+barFlow};
}
test('SSR retains fixed CTA clearance before its portal mounts, then remeasures the portaled bar',()=>{
 const app=actionBar();let view=layout(app.render());assert.equal(Boolean(view.portal),false);assert.equal(view.bar.props['data-wizard-action-bar-docked'],'true');assert.equal(Boolean(view.spacer.props.hidden),false);assert.equal(view.buttons.length,1);
 app.flush();const initialResize=app.resizeObservers.at(-1);assert.ok(initialResize);view=layout(app.render());assert.ok(view.portal);app.flush();assert.equal(initialResize.disconnected,true);assert.ok(app.resizeObservers.length>=2);assert.equal(app.resizeObservers.at(-1).node.kind,'bar');assert.equal(view.flow,101);view.buttons[0].props.onClick();assert.equal(app.primaryCalls,1);
});
test('deferred dock/inline handoff keeps one bar-sized flow box while CSS height changes lag',()=>{
 const app=actionBar();app.render();app.flush();let view=layout(app.render());assert.ok(view.portal);assert.equal(view.flow,101);assert.equal(view.buttons.length,1);
 for(let i=0;i<4;i++){
  app.flush();view=layout(app.render({suspendDock:true}));assert.equal(Boolean(view.portal),false);assert.equal(view.flow,101);assert.equal(view.buttons.length,1);assert.equal(view.bar.props['data-wizard-action-bar-docked'],'false');view.buttons[0].props.onClick();
  app.flush();view=layout(app.render({suspendDock:false}));assert.ok(view.portal);assert.equal(view.flow,101);assert.equal(view.buttons.length,1);
 }
 assert.equal(app.primaryCalls,4);
});
test('offscreen and keyboard transitions retain the actual action without duplicate inline clearance',()=>{
 const app=actionBar();app.render();app.flush();app.render();app.flush();for(const observer of app.observers)observer.callback([{isIntersecting:false}]);let view=layout(app.render());assert.equal(Boolean(view.portal),false);assert.equal(view.flow,101);assert.equal(view.buttons.length,1);
 app.setKeyboard(240);view=layout(app.render());assert.ok(view.portal);assert.equal(view.flow,101);assert.equal(view.bar.props.style.bottom,240);
 view=layout(app.render({suspendDock:true}));assert.equal(Boolean(view.portal),false);assert.equal(view.flow,101);assert.equal(view.buttons.length,1);
});

test('default spacer observer follows the visible inline bar and redocks after it reenters view',()=>{
 const app=actionBar(),props={dockWhenFormInView:false};app.render(props);app.flush();app.render(props);app.flush();
 const active=()=>app.observers.filter(observer=>!observer.disconnected&&observer.options?.rootMargin==='80px 0px 80px 0px').at(-1);
 assert.equal(active().node.kind,'spacer');active().callback([{isIntersecting:false}]);let view=layout(app.render(props));assert.equal(view.bar.props['data-wizard-action-bar-docked'],'false');app.flush();assert.equal(active().node.kind,'bar');
 active().callback([{isIntersecting:true}]);view=layout(app.render(props));assert.ok(view.portal);assert.equal(view.flow,101);app.flush();assert.equal(active().node.kind,'spacer');assert.equal(view.buttons.length,1);
});

test('a held pointer at the scroll limit keeps its viewport target across an inline handoff',()=>{
 const app=actionBar();app.render();app.flush();app.render();app.flush();const before=Number.parseFloat(app.style.getPropertyValue('--wizard-bar-clearance'));assert.ok(before>=85,'The active fixed bar has document clearance');
 const baseMaxScroll=921,documentButtonTop=1304,heldScroll=baseMaxScroll+before,downY=documentButtonTop-heldScroll;const writes=app.styleEvents.length;
 app.render({suspendDock:true});app.flush();app.render({suspendDock:true});app.flush();const after=Number.parseFloat(app.style.getPropertyValue('--wizard-bar-clearance'))||0;const upScroll=Math.min(heldScroll,baseMaxScroll+after);
 assert.equal(documentButtonTop-upScroll,downY,'Undocking cannot clamp max scroll under the held pointer');assert.equal(app.styleEvents.length,writes,'Handoff never deletes or rewrites the document reservation');
 app.unmount();assert.equal(app.style.getPropertyValue('--wizard-bar-clearance'),'');
});
test('multiple pinned consumers retain the largest reservation and restore preexisting priority exactly',()=>{
 const app=actionBar('48px','important');app.render();app.flush();app.render();app.flush();const sibling=app.reserveOther();sibling.update(160);const writes=app.styleEvents.length;
 assert.equal(app.style.getPropertyValue('--wizard-bar-clearance'),'max(48px, 160px)');assert.equal(app.style.getPropertyPriority('--wizard-bar-clearance'),'important');sibling.update(88);sibling.release();sibling.release();sibling.update(240);
 assert.equal(app.styleEvents.length,writes,'Shorter measurement/sibling cleanup cannot shrink a live document');app.unmount();assert.equal(app.style.getPropertyValue('--wizard-bar-clearance'),'48px');assert.equal(app.style.getPropertyPriority('--wizard-bar-clearance'),'important');
 const later=app.reserveOther();later.update(64);assert.equal(app.style.getPropertyValue('--wizard-bar-clearance'),'max(48px, 64px)');later.release();assert.equal(app.style.getPropertyValue('--wizard-bar-clearance'),'48px');
});

test('inherited clearance and invalid measurements preserve safe CSS and exact final restoration',()=>{
 const events=[],values=new Map();const style={getPropertyValue:key=>values.get(key)?.value??'',getPropertyPriority:key=>values.get(key)?.priority??'',setProperty(key,value,priority=''){values.set(key,{value,priority});events.push(['set',value,priority]);},removeProperty(key){values.delete(key);events.push(['remove']);}};
 const registry=createPageClearanceRegistry(style,()=> ' calc(1rem + 2px) ');const lease=registry.reserve();for(const height of [NaN,Infinity,-1,0])lease.update(height);assert.equal(events.length,0);lease.update(85);assert.equal(style.getPropertyValue('--wizard-bar-clearance'),'max(calc(1rem + 2px), 85px)');const count=events.length;lease.update(40);lease.update(NaN);assert.equal(events.length,count);lease.release();lease.release();lease.update(200);assert.equal(style.getPropertyValue('--wizard-bar-clearance'),'');assert.deepEqual(events.at(-1),['remove']);
});
