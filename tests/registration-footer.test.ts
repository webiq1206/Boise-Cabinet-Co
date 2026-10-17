import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { generateLocalBusinessSchema, generateOrganizationSchema, generateServiceSchema } from "../lib/schema.ts";
import { getAllSiteUrls } from "../lib/siteUrls.ts";
import { showFoundingYear, SITE_CONFIG } from "../shared/siteConfig.ts";

test("license number defaults to 8381215 and schema uses hasCredential", () => {
  assert.equal(SITE_CONFIG.trust.licenseNumber, process.env.NEXT_PUBLIC_LICENSE_NUMBER || "8381215");
  assert.equal(SITE_CONFIG.trust.licenseNumber, "8381215");

  const home = generateLocalBusinessSchema() as {
    hasCredential: {
      "@type": string;
      identifier: string;
      credentialCategory: string;
      recognizedBy: { "@type": string; name: string; url: string };
    };
  };
  assert.equal(home.hasCredential["@type"], "EducationalOccupationalCredential");
  assert.equal(home.hasCredential.identifier, "8381215");
  assert.equal(home.hasCredential.credentialCategory, "registration");
  assert.equal(home.hasCredential.recognizedBy["@type"], "GovernmentOrganization");
  assert.equal(home.hasCredential.recognizedBy.name, "Idaho Division of Occupational and Professional Licenses");
  assert.equal(home.hasCredential.recognizedBy.url, "https://dopl.idaho.gov/con/");

  const area = generateLocalBusinessSchema("Meridian") as { hasCredential: { identifier: string } };
  assert.equal(area.hasCredential.identifier, "8381215");

  const service = generateServiceSchema("Cabinet installation", "Installation") as {
    provider: { hasCredential: { identifier: string } };
  };
  assert.equal(service.provider.hasCredential.identifier, "8381215");
});

test("sitemap pages get a visible registration line, and estimate stays plain text", () => {
  const footer = readFileSync("components/Footer.tsx", "utf8");
  assert.match(footer, /\{`Idaho Registered Contractor #\$\{SITE_CONFIG\.trust\.licenseNumber\}`\}/);
  assert.match(footer, /https:\/\/edopl\.idaho\.gov\/OnlineServices\/\?link=PubSearch/);
  assert.match(footer, /target="_blank"/);
  assert.match(footer, /rel="noopener noreferrer"/);
  assert.match(footer, /title="Look up registration 8381215 on Idaho DOPL"/);
  assert.match(footer, /aria-label="Verify with Idaho DOPL: look up registration 8381215, opens in a new tab"/);
  assert.equal(footer.includes("(#8381215)"), false);
  assert.equal(footer.includes("whitespace-nowrap"), false);
  assert.equal(footer.includes("truncate"), false);
  assert.equal(footer.includes("line-clamp"), false);
  assert.equal(footer.includes("overflow-hidden"), false);

  const estimate = readFileSync("app/estimate/layout.tsx", "utf8");
  assert.match(estimate, /\{`Idaho Registered Contractor #\$\{SITE_CONFIG\.trust\.licenseNumber\}`\}/);
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

test("brand license claims use Idaho registration wording", () => {
  const files = [
    "lib/seo.ts",
    "lib/schema.ts",
    "shared/seoContent.ts",
    "shared/siteContent.ts",
    "app/about/page.tsx",
    "shared/llmsTxt.ts",
  ];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    assert.equal(/\bLicensed\b/.test(text), false, file);
    assert.equal(/licensed, bonded, and insured/.test(text), false, file);
    assert.equal(/License details available upon request/.test(text), false, file);
  }
  const faqs = readFileSync("shared/seoContent.ts", "utf8");
  assert.match(faqs, /Are you a registered contractor and insured\?/);
  assert.match(faqs, /an Idaho Registered Contractor #8381215, bonded, and insured/);
  const about = readFileSync("app/about/page.tsx", "utf8");
  assert.match(about, /Are you a registered contractor and insured\?/);
  assert.match(about, /Idaho Registered Contractor #8381215, bonded, and insured/);
  assert.equal(about.includes("contractor license"), false);
  assert.equal(about.includes("available upon request"), false);
});

test("home JSON-LD uses registration wording and hides foundingDate unless the flag is on", () => {
  assert.equal(showFoundingYear(), false);
  assert.equal(showFoundingYear("true"), true);
  const home = generateOrganizationSchema() as { description: string; foundingDate?: string; hasCredential: { identifier: string } };
  assert.match(home.description, /Idaho Registered Contractor #8381215, bonded, and insured, and committed to craftsmanship\./);
  assert.equal(home.description.includes("since 2020"), false);
  assert.equal(home.foundingDate, undefined);
  assert.equal(home.hasCredential.identifier, "8381215");
  const local = generateLocalBusinessSchema() as { foundingDate?: string };
  assert.equal(local.foundingDate, undefined);
  process.env.SHOW_FOUNDING_YEAR = "true";
  const shown = generateOrganizationSchema() as { description: string; foundingDate?: string };
  assert.equal(shown.foundingDate, "2020");
  assert.match(shown.description, /since 2020/);
  delete process.env.SHOW_FOUNDING_YEAR;
});

test("estimate scope meta uses registration wording", () => {
  const scope = readFileSync("app/estimate/scope/page.tsx", "utf8");
  assert.match(scope, /Idaho Registered Contractor #8381215, bonded & insured\./);
  assert.equal(scope.includes("Licensed & insured"), false);
});
