import {expect, type Page} from '@playwright/test';

export async function isolateFixtureRequests(page: Page) {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.pathname.startsWith('/api/')) return route.abort('blockedbyclient');
    return route.continue();
  });
}

/** The optional public planner is distinct from /estimate/scope's retained engine. */
export async function openGuidedRequest(page: Page) {
  await expect(page.locator('#estimate-request form')).toBeVisible();
  const summary = page.locator('summary', {hasText: 'Prefer a step-by-step planning range?'});
  await expect(summary).toBeVisible();
  await summary.focus();
  await summary.press('Enter');
  await expect(summary.locator('..')).toHaveAttribute('open', '');
  await expect(summary.locator('..').locator('[data-estimate-wizard]')).toBeVisible();
}
