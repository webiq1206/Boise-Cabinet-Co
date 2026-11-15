import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const base=process.env.CABINET_TEST_BASE_URL||'http://127.0.0.1:5103';
assert.ok(['localhost','127.0.0.1','::1'].includes(new URL(base).hostname),'Only an isolated loopback preview is allowed');
const output=process.env.CABINET_DOCK_OUTPUT||'p5-verification/cabinet-quote-dock';await mkdir(output,{recursive:true});
const config=JSON.parse(await readFile('.next/required-server-files.json','utf8'));
const runtime=JSON.parse(config.config.env.NEXT_PUBLIC_P5_RELEASE);const buildId=(await readFile('.next/BUILD_ID','utf8')).trim();
const browser=await chromium.launch({executablePath:process.env.P5_TEST_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
const results=[];
for(const reducedMotion of ['reduce','no-preference']){
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion,serviceWorkers:'block'});
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin===base&&((route.request().method()==='GET'&&!url.pathname.startsWith('/api/'))||(url.pathname==='/api/estimate/planning-range'&&route.request().method()==='POST')))return route.continue();return route.fulfill({status:503,contentType:'application/json',body:'{"accepted":false,"fixture":"downstream blocked"}'});});
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));let frames=[];
 try{
  await page.goto(base+'/estimate',{waitUntil:'networkidle'});const details=page.getByTestId('estimate-d2-details');await details.locator('summary').click();
  frames=await page.evaluate(()=>new Promise(resolve=>{
   const rows=[];let done=false;function sample(){const button=[...document.querySelectorAll('[data-testid="wizard-next"]')].find(el=>el.offsetParent!==null);const bar=document.querySelector('[data-wizard-action-bar-pinned="true"]');const spacer=document.querySelector('[data-wizard-action-bar-spacer]');if(button&&bar&&spacer){rows.push({time:performance.now(),top:button.getBoundingClientRect().top,wizardTop:document.querySelector('[data-estimate-wizard]').getBoundingClientRect().top,docked:bar.getAttribute('data-wizard-action-bar-docked'),barHeight:bar.getBoundingClientRect().height,spacerHeight:spacer.getBoundingClientRect().height,spacerHidden:spacer.hidden,spacerMargin:getComputedStyle(spacer).marginTop});}if(!done)requestAnimationFrame(sample);}requestAnimationFrame(sample);setTimeout(()=>{done=true;resolve(rows);},2400);
  }));
  assert.ok(frames.length>=8,'Enough real animation frames are required to assess stability');const last=frames.filter(frame=>frame.time>=frames.at(-1).time-1000);assert.ok(last.length>=5,'The final second must contain observable frames');const movement=Math.max(...last.map(frame=>frame.top))-Math.min(...last.map(frame=>frame.top));assert.ok(movement<=1,`${reducedMotion}: action moved ${movement}px repeatedly`);
  const bar=page.locator('[data-wizard-action-bar-pinned="true"]');await expect(bar).toHaveAttribute('data-wizard-action-bar-docked','false');await expect(bar.locator('button')).toHaveCount(1);await expect(page.locator('[data-wizard-action-bar-spacer]')).toBeHidden();
  await page.getByTestId('button-project-kitchen').click();await expect(page.getByTestId('button-project-kitchen')).toHaveAttribute('aria-pressed','true');await page.locator('[data-testid="wizard-next"]:visible').last().click();await expect(page.getByTestId('slider-size')).toBeVisible();
  await details.locator('summary').click();await expect(bar).toHaveAttribute('data-wizard-action-bar-docked','true');await expect(bar.locator('button')).toHaveCount(1);await expect(page.locator('[data-wizard-action-bar-spacer]')).not.toBeHidden();assert.deepEqual(errors,[]);
  results.push({reducedMotion,passed:true,frameCount:frames.length,lastSecondMovement:movement});
 }catch(error){results.push({reducedMotion,passed:false,error:String(error),frameCount:frames.length,pageErrors:errors});await page.screenshot({path:path.join(output,reducedMotion+'-failure.png')}).catch(()=>{});}
 await writeFile(path.join(output,reducedMotion+'-frames.json'),JSON.stringify(frames,null,2));await context.close();
}
await browser.close();const report={runtime,buildId,viewport:{width:1440,height:900},browser:'Chromium emulation',results,passed:results.every(result=>result.passed),noBusinessSubmissions:true};await writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
