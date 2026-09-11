import {expect,test} from '@playwright/test';
test.use({viewport:{width:390,height:844}});
test('mobile input and navigation remain in normal document flow',async({page})=>{
 await page.goto('/estimate');
 const estimator=page.locator('[data-p5-estimator]');
 const next=estimator.getByRole('button',{name:'Continue',exact:true});
 await expect(next).toBeVisible({timeout:30000});
 expect(await next.evaluate(el=>getComputedStyle(el).position)).not.toMatch(/fixed|sticky/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await expect(page.getByTestId('button-open-estimate-sheet')).toHaveCount(0);
});
