import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

/** Execute the actual component with deferred passive effects and native viewport events. */
function component(initialPath='/',initialHash=''){
 let pathname=initialPath,hook=0,scrollY=0,clock=10_000,nextId=1;
 const refs=[],dependencies=[],pending=[],cleanup=[],calls=[],events=new Map(),frames=new Map(),timers=new Map();
 const exports={};
 const react={useRef(value){const index=hook++;return refs[index]??= {current:value};},useEffect(effect,deps){const index=hook++,before=dependencies[index];if(!before||deps.some((value,i)=>value!==before[i]))pending.push({effect,index});dependencies[index]=deps;}};
 const location={pathname,hash:initialHash};
 const window={location,get scrollY(){return scrollY;},scrollTo(options){calls.push({...options});scrollY=options.top;},addEventListener(name,listener){if(!events.has(name))events.set(name,new Set());events.get(name).add(listener);},removeEventListener(name,listener){events.get(name)?.delete(listener);},setTimeout(callback,delay){const id=nextId++;timers.set(id,{callback,delay});return id;},clearTimeout(id){timers.delete(id);}};
 const source=readFileSync('components/ScrollToTop.tsx','utf8');
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require(name){if(name==='react')return react;if(name==='next/navigation')return{usePathname:()=>pathname};throw new Error('Unexpected dependency '+name);},window,Date:{now:()=>clock},requestAnimationFrame(callback){const id=nextId++;frames.set(id,callback);return id;},cancelAnimationFrame(id){frames.delete(id);}});
 return {calls,render(nextPath=pathname){pathname=nextPath;location.pathname=nextPath;hook=0;exports.ScrollToTop();},flush(){for(const item of pending.splice(0)){cleanup[item.index]?.();cleanup[item.index]=item.effect();}},move(top){scrollY=top;},hash(value){location.hash=value;},event(name){for(const listener of events.get(name)??[])listener();},settle(){for(const [id,callback]of [...frames]){frames.delete(id);callback();}for(const [id,item]of [...timers]){timers.delete(id);clock+=item.delay;item.callback();}},advance(ms){clock+=ms;},clearCalls(){calls.splice(0);},get scrollY(){return scrollY;}};
}

test('delayed initial hydration cannot move an existing pointer target',()=>{
 const app=component();app.render();app.move(1213);app.flush();app.settle();assert.equal(app.scrollY,1213);assert.deepEqual(app.calls,[]);
});
test('initial native hash and restored history positions survive hydration',()=>{
 for(const [hash,position]of [['#planning',480],['',860]]){const app=component('/estimate',hash);app.move(position);app.render();app.flush();app.settle();assert.equal(app.scrollY,position);assert.deepEqual(app.calls,[]);}
});
test('later client route changes retain deliberate frame and timer reassertions',()=>{
 const app=component();app.render();app.flush();app.clearCalls();app.move(900);app.render('/estimate');app.flush();assert.equal(app.scrollY,0);assert.equal(app.calls.length,1);
 app.move(64);app.settle();assert.equal(app.scrollY,0);assert.equal(app.calls.length,2);
 app.move(380);app.render('/estimate');app.flush();app.settle();assert.equal(app.scrollY,380);assert.equal(app.calls.length,2);
});
test('native hash destinations on later routes remain authoritative',()=>{
 const app=component();app.render();app.flush();app.clearCalls();app.hash('#request');app.move(480);app.render('/estimate');app.flush();app.settle();assert.equal(app.scrollY,480);assert.deepEqual(app.calls,[]);
});
test('later native history restoration does not disable a subsequent fresh client navigation',()=>{
 const app=component('/estimate');app.render();app.flush();app.clearCalls();app.move(860);app.render('/services');app.event('popstate');app.flush();app.settle();assert.equal(app.scrollY,860);assert.deepEqual(app.calls,[]);
 app.render('/contact');app.flush();assert.equal(app.scrollY,0);assert.equal(app.calls.length,1);
});
test('wheel, touch and keyboard interaction cancel later reassertions',()=>{
 for(const event of ['wheel','touchstart','keydown']){const app=component();app.render();app.flush();app.clearCalls();app.render('/estimate');app.flush();app.move(222);app.event(event);app.settle();assert.equal(app.scrollY,222,event);assert.equal(app.calls.length,1,event);}
});
test('route cleanup cancels superseded frame/timer work',()=>{
 const app=component();app.render();app.flush();app.clearCalls();app.render('/estimate');app.flush();app.render('/contact');app.flush();app.move(600);app.event('keydown');app.settle();assert.equal(app.scrollY,600);assert.equal(app.calls.length,2);
});
