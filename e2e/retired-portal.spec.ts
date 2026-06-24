import { expect, test } from "@playwright/test";

/**
 * The subcontractor portal and lead marketplace were removed. These routes must
 * no longer resolve to a working page: legacy `/subcontractor` and `/partner`
 * URLs are 301'd to the homepage, and the marketplace APIs are gone (404).
 */
test.describe("Retired subcontractor portal", () => {
  test("legacy /subcontractor redirects home", async ({ page }) => {
    await page.goto("/subcontractor");
    await expect(page).toHaveURL(/\/$|\/?$/);
    await expect(page.getByText(/subcontractor portal/i)).toHaveCount(0);
  });

  test("legacy /partner redirects home", async ({ page }) => {
    await page.goto("/partner");
    await expect(page).toHaveURL(/\/$|\/?$/);
  });

  test("marketplace and legacy quote APIs are gone", async ({ request }) => {
    for (const url of [
      "/api/quotes",
      "/api/leads/watchlist",
      "/api/create-payment-intent",
      "/api/admin/subcontractors",
    ]) {
      const res = await request.get(url);
      expect(res.status(), `${url} should not exist`).toBe(404);
    }
  });

  test("homepage footer has no Partner Login link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /partner login/i })).toHaveCount(0);
  });
});
