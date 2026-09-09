import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('p5-verification',{recursive:true});const browser=await chromium.launch();const results=[];
for(const width of [320,390,430,768,1024,1440,1920]){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<768});const page=await context.newPage();const r={width,passed:false};
 try{
 await page.goto('http://127.0.0.1:5000/search');const input=page.getByRole('searchbox',{name:'Search by name or code'});
 await input.fill('shaker');await expect(page.locator('[data-testid^="search-result-"]').first()).toBeVisible();await expect(page.getByRole('status')).toContainText('results');
 await input.fill('p5auditnomatchzzzz');await expect(page.getByRole('status')).toContainText('No matches');
 await expect(page.locator('[data-testid^="search-result-"]')).toHaveCount(0);
 await input.fill('');const matte=page.getByRole('button',{name:'matte',exact:true});await matte.click();await expect(matte).toHaveAttribute('aria-pressed','true');await matte.click();await expect(matte).toHaveAttribute('aria-pressed','false');
 await input.focus();await page.waitForTimeout(250);if(width<1280)await expect(page.locator('div.fixed.left-0.right-0.bottom-0').filter({visible:true})).toHaveCount(0);
 await expect(page.getByTestId('assistant-launcher')).toHaveCount(0);
 r.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);expect(r.overflow).toBe(false);
 await page.screenshot({path:'p5-verification/product-search-'+width+'.jpg'});r.passed=true;
 }catch(e){r.error=e.message;await page.screenshot({path:'p5-verification/product-search-failure-'+width+'.jpg'}).catch(()=>{})}
 results.push(r);await context.close();
}
await browser.close();await writeFile('p5-verification/product-search-results.json',JSON.stringify(results));if(results.some(r=>!r.passed))process.exitCode=1;
