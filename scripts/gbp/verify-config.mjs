/**
 * Validates GBP config char limits and URL shape.
 * Run: npx tsx scripts/gbp/verify-config.mjs
 */
const {
  GBP_BUSINESS_DESCRIPTION,
  GBP_SERVICES,
  GBP_QA_SEEDS,
  GBP_PROFILE,
} = await import("../../shared/gbpConfig.ts");

let failed = false;

if (GBP_BUSINESS_DESCRIPTION.length > 750) {
  console.error(`FAIL: business description ${GBP_BUSINESS_DESCRIPTION.length} chars (max 750)`);
  failed = true;
} else {
  console.log(`OK: business description ${GBP_BUSINESS_DESCRIPTION.length}/750 chars`);
}

for (const s of GBP_SERVICES) {
  if (s.description.length > 300) {
    console.error(`FAIL: service "${s.name}" description ${s.description.length} chars (max 300)`);
    failed = true;
  }
}
console.log(`OK: ${GBP_SERVICES.length} services within 300-char descriptions`);

for (const qa of GBP_QA_SEEDS) {
  if (!qa.question || !qa.answer) {
    console.error(`FAIL: empty Q&A pair`);
    failed = true;
  }
  if (qa.answer.toLowerCase().includes("showroom")) {
    console.error(`FAIL: Q&A "${qa.question}" mentions showroom`);
    failed = true;
  }
}
console.log(`OK: ${GBP_QA_SEEDS.length} Q&A pairs (no showroom references)`);

if (!GBP_PROFILE.websiteUrl.includes("utm_source=gbp")) {
  console.error("FAIL: website URL missing UTM");
  failed = true;
}

if (failed) process.exit(1);
console.log("GBP config verification passed.");
