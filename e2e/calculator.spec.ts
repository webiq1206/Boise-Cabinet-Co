import {verifyCabinetEntry} from '../scripts/lib/shortBrandEntry.mjs';
import {isolateFixtureRequests} from './guided-fixture';
import {expect,test} from '@playwright/test';
test.beforeEach(async ({page}) => isolateFixtureRequests(page));
for (const path of ['/','/estimate','/estimate/scope']) {
 test(`one project input at ${path}`,async({page})=>{
  await page.goto(path);
  if(path!=='/estimate/scope'){await verifyCabinetEntry(page,path);return;}
  const estimator=page.locator('[data-p5-estimator]').first();
  await expect(estimator.getByLabel('Tell us about your project',{exact:true})).toBeVisible({timeout:30000});
  await expect(estimator.getByRole('button',{name:'Send message',exact:true})).toBeVisible();
  await expect(estimator.getByRole('button',{name:'Use microphone',exact:true})).toHaveCount(0);
  await expect(estimator.locator('input[type=file]')).toHaveCount(1);
  await expect(estimator.getByLabel('Upload project files',{exact:true})).toHaveCount(1);
  await expect(estimator.getByLabel('Upload estimating instructions',{exact:true})).toHaveCount(0);
  await expect(estimator.locator('textarea')).toHaveCount(1);
  await expect(estimator).not.toContainText(/Continue manually|Manual Estimate|Upload Scope/);
 });
}
