import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { generateLocalBusinessSchema, generateServiceSchema } from "../lib/schema.ts";
import { getAllSiteUrls } from "../lib/siteUrls.ts";
import { SITE_CONFIG } from "../shared/siteConfig.ts";

const LINE = "Idaho Registered Contractor #";

test("license number defaults to 8381215 and schema uses hasCredential", () => {
  assert.equal(SITE_CONFIG.trust.licenseNumber, process.env.NEXT_PUBLIC_LICENSE_NUMBER || "8381215");
  assert.equal(SITE_CONFIG.trust.licenseNumber, "8381215");

  const home = generateLocalBusinessSchema() as {
    hasCredential: { "@type": string; identifier: string; credentialCategory: string };
  };
  assert.equal(home.hasCredential["@type"], "EducationalOccupationalCredential");
  assert.equal(home.hasCredential.identifier, "8381215");
  assert.equal(home.hasCredential.credentialCategory, "Idaho Registered Contractor");

  const area = generateLocalBusinessSchema("Meridian") as { hasCredential: { identifier: string } };
  assert.equal(area.hasCredential.identifier, "8381215");

  const service = generateServiceSchema("Cabinet installation", "Installation") as {
    provider: { hasCredential: { identifier: string } };
  };
  assert.equal(service.provider.hasCredential.identifier, "8381215");
});

test("sitemap pages get a visible registration line, and estimate stays plain text", () => {
  const footer = readFileSync("components/Footer.tsx", "utf8");
  assert.match(footer, new RegExp(`${LINE}\\{SITE_CONFIG\\.trust\\.licenseNumber\\}`));
  assert.match(footer, /https:\/\/edopl\.idaho\.gov\/OnlineServices\/\?link=PubSearch/);
  assert.equal(footer.includes("(#8381215)"), false);
  assert.equal(footer.includes("whitespace-nowrap"), false);
  assert.equal(footer.includes("truncate"), false);
  assert.equal(footer.includes("line-clamp"), false);
  assert.equal(footer.includes("overflow-hidden"), false);

  const estimate = readFileSync("app/estimate/layout.tsx", "utf8");
  assert.match(estimate, new RegExp(`${LINE}\\{SITE_CONFIG\\.trust\\.licenseNumber\\}`));
  assert.equal(estimate.includes("edopl.idaho.gov"), false);
  assert.match(estimate, /overflow: "visible"/);
  assert.equal(estimate.includes("whitespace-nowrap"), false);
  assert.equal(estimate.includes("truncate"), false);

  const layout = readFileSync("app/layout.tsx", "utf8");
  assert.match(layout, /ConditionalFooter/);
  const paths = getAllSiteUrls().map((entry) => entry.path);
  assert.equal(paths.includes("/"), true);
  assert.equal(paths.includes("/contact"), true);
  assert.equal(paths.includes("/estimate"), true);
  assert.equal(paths.some((path) => path.startsWith("/locations/")), true);
});
