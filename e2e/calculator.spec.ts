import {expect,test} from '@playwright/test';
for (const path of ['/#calculator','/estimate','/estimate/scope']) {
 test(`one project input at ${path}`,async({page})=>{
  await page.goto(path);
  const estimator=page.locator('[data-p5-estimator]').first();
  await expect(estimator.getByLabel('Tell us about your project',{exact:true})).toBeVisible({timeout:30000});
  await expect(estimator.getByRole('button',{name:'Continue',exact:true})).toBeVisible();
  await expect(estimator.getByRole('button',{name:'Use microphone',exact:true})).toBeVisible();
  await expect(estimator.locator('input[type=file]')).toHaveCount(2);
  await expect(estimator.getByLabel('Upload plans, photos or documents',{exact:true})).toHaveCount(1);
  await expect(estimator.getByLabel('Upload estimating instructions',{exact:true})).toHaveCount(1);
  await expect(estimator.getByLabel('Custom estimating instructions',{exact:true})).toBeVisible();
  await expect(estimator).not.toContainText(/Continue manually|Manual Estimate|Upload Scope/);
 });
}
