/**
 * Fails the build if customer-facing source or the generated llms text makes
 * an inquiry response-time promise ("within one business day", "reply in
 * minutes", "24-hour reply", "fast replies" and the like). Say we answer
 * questions instead; see scripts/lib/prohibitedResponseLanguage.ts. It also
 * fails on the release 2 prohibited claims (bonded, instant estimates, one
 * contract or invoice, subcontractor coverage, builder 50/50).
 *
 * Run: npm run verify:response-language (in prebuild).
 */
import path from "node:path";
import { LLMS_TXT } from "../shared/llmsTxt";
import {
  findProhibitedClaims,
  findProhibitedResponseLanguage,
  scanSourceForProhibitedClaims,
  scanSourceForResponsePromises,
} from "./lib/prohibitedResponseLanguage";

const ROOT = path.join(__dirname, "..");
const failures = scanSourceForResponsePromises(ROOT);
for (const hit of findProhibitedResponseLanguage(LLMS_TXT)) failures.push({ file: "generated /llms.txt", ...hit });

// Release 2 owner decisions: no bonded, instant-estimate, one-invoice,
// subcontractor-coverage or builder 50/50 claims in public source.
const claimFailures = scanSourceForProhibitedClaims(ROOT);
for (const hit of findProhibitedClaims(LLMS_TXT)) claimFailures.push({ file: "generated /llms.txt", ...hit });
if (claimFailures.length > 0) {
  console.error(`Prohibited claim violations: ${claimFailures.length}`);
  for (const f of claimFailures.slice(0, 40)) console.error(`  ${f.file} [${f.label}]  ...${f.excerpt}...`);
  process.exit(1);
}

if (failures.length > 0) {
  console.error(`Response-time promise violations: ${failures.length}`);
  for (const f of failures.slice(0, 40)) console.error(`  ${f.file} [${f.label}]  ...${f.excerpt}...`);
  process.exit(1);
}

console.log("verify-response-language: OK");
