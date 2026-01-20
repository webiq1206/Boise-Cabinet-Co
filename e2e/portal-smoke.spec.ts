import { expect, test } from "@playwright/test";

test("portal smoke: quote → admin → subcontractor (no Stripe)", async ({ page }) => {
  // Dev login + seed
  await page.goto("/__dev__/login");
  await expect(page.getByTestId("page-dev-login")).toBeVisible();

  await page.getByTestId("button-dev-login-admin").click();
  await expect(page.getByTestId("page-admin-dashboard")).toBeVisible();

  await page.goto("/__dev__/login");
  await page.getByTestId("button-dev-seed").click();

  // Admin dashboard: tab counts remain stable across tab switching
  await page.goto("/admin/dashboard");
  await expect(page.getByTestId("count-pending")).toBeVisible();

  const pendingCountBefore = await page.getByTestId("count-pending").textContent();
  const acceptedCountBefore = await page.getByTestId("count-accepted").textContent();
  const availableCountBefore = await page.getByTestId("count-available").textContent();
  const purchasedCountBefore = await page.getByTestId("count-purchased").textContent();

  await page.getByTestId("tab-available").click();
  await page.getByTestId("tab-pending").click();

  await expect(page.getByTestId("count-pending")).toHaveText((pendingCountBefore || "").trim());
  await expect(page.getByTestId("count-accepted")).toHaveText((acceptedCountBefore || "").trim());
  await expect(page.getByTestId("count-available")).toHaveText((availableCountBefore || "").trim());
  await expect(page.getByTestId("count-purchased")).toHaveText((purchasedCountBefore || "").trim());

  // Quote wizard: submit quote and show quote reference
  await page.goto("/get-quote");
  await page.getByTestId("city-kuna").click();
  await page.getByTestId("input-address").fill("123 Test St");
  await page.getByTestId("button-use-address").click();
  await page.getByTestId("button-residential").click();
  await page.getByTestId("button-continue-to-services").click();

  await page.getByTestId("intent-lawn-mowing").click();
  await page.getByTestId("button-continue-to-review").click();

  await page.getByTestId("input-name").fill("Playwright Test");
  await page.getByTestId("input-email").fill("playwright@example.com");
  await page.getByTestId("input-phone").fill("2085550101");
  await page.getByTestId("button-submit-quote").click();

  await expect(page.getByText(/Quote Submitted!/i)).toBeVisible();
  await expect(page.getByText(/Quote Reference:/i)).toBeVisible();

  // Subcontractor portal: loads and shows masked leads (no Stripe required)
  await page.goto("/__dev__/login");
  await page.getByTestId("button-dev-login-sub").click();
  await expect(page.getByTestId("page-subcontractor-portal")).toBeVisible();

  const firstCard = page.locator("[data-testid^='card-lead-']").first();
  await expect(firstCard).toBeVisible();
  await expect(firstCard).toContainText("***");
});

