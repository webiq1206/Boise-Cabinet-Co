import {isolateFixtureRequests} from './guided-fixture';
import {expect,test} from '@playwright/test';
test.beforeEach(async ({page}) => isolateFixtureRequests(page));
test.use({viewport:{width:390,height:844}});
test('mobile input and navigation remain in normal document flow',async({page})=>{
 await page.goto('/estimate/scope');
 const estimator=page.locator('[data-p5-estimator]');
 const next=estimator.getByRole('button',{name:'Send message',exact:true});
 await expect(next).toBeVisible({timeout:30000});
 expect(await next.evaluate(el=>getComputedStyle(el).position)).not.toMatch(/fixed|sticky/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await expect(page.getByTestId('button-open-estimate-sheet')).toHaveCount(0);
});
