import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { generateLocalBusinessSchema, generateServiceSchema } from "../lib/schema.ts";
import { getAllSiteUrls } from "../lib/siteUrls.ts";
import { SITE_CONFIG } from "../shared/siteConfig.ts";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Footer } from "../components/Footer.tsx";

(globalThis as typeof globalThis & { React: typeof React }).React = React;
/** The footer is the shared family SiteFooter (lib/familyBrand.ts), so its rendered HTML is what is checked. */
const renderFooter = () => renderToStaticMarkup(React.createElement(Footer));

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
  const footer = renderFooter();
  assert.equal((footer.match(/>P5 Home Co LLC, Idaho Registered Contractor #8381215<\/a>/g) ?? []).length, 1);
  assert.match(footer, /https:\/\/edopl\.idaho\.gov\/OnlineServices\/\?link=PubSearch/);
  assert.match(footer, /target="_blank"/);
  assert.match(footer, /rel="noopener noreferrer"/);
  assert.match(footer, /title="Idaho contractor registration 8381215"/);
  assert.match(footer, /aria-label="Idaho contractor registration 8381215 \(opens in a new tab\)"/);
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
  assert.match(faqs, /P5 Home Co LLC, Idaho Registered Contractor #8381215. Insured; certificate on request/);
  const about = readFileSync("app/about/page.tsx", "utf8");
  assert.match(about, /Is \$\{SITE_CONFIG.name\} a registered contractor and insured\?/);
  assert.match(about, /REGISTERED_INSURED|CABINET_WORKMANSHIP_WARRANTY/);
});
