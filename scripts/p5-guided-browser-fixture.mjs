import assert from 'node:assert/strict';

/** Enter the real optional guided UI without bypassing its keyboard interaction. */
export async function openOptionalGuidedFlow(page) {
 const summary=page.locator('summary',{hasText:'Prefer the guided project flow?'});
 if(!await summary.count())return;
 assert.ok(await page.locator('#estimate-request form').isVisible(),'Basic request stays available without guided intake');
 const details=summary.locator('..');
 if(!await details.evaluate(el=>el.open)){
  await summary.focus();await summary.press('Enter');
 }
 assert.equal(await details.evaluate(el=>el.open),true,'Optional guided flow opens by keyboard');
 await details.locator('#calculator').scrollIntoViewIfNeeded();
}
