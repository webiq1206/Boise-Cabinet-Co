import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { HOMEPAGE_FAQS } from "../shared/homepageFaqs.ts";
import { publishedWarrantySummary } from "../shared/publishedWarranty.ts";
import { showLifetimeWarranty } from "../shared/siteConfig.ts";

test("lifetime warranty wording stays in source and stays off", () => {
  assert.equal(showLifetimeWarranty(), false);
  assert.equal(showLifetimeWarranty("true"), true);
  assert.equal(publishedWarrantySummary().toLowerCase().includes("lifetime"), false);

  const homepage = HOMEPAGE_FAQS.map((item) => item.a).join("\n");
  assert.equal(homepage.toLowerCase().includes("lifetime"), false);

  const catalog = readFileSync("shared/catalog/generated/content.ts", "utf8");
  assert.match(catalog, /Limited lifetime warranty/);
  const home = readFileSync("app/page.tsx", "utf8");
  assert.match(home, /lifetime workmanship warranty/);
});
