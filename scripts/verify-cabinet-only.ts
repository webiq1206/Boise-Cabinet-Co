/**
 * Guards that the site stays cabinet-only and that the retired subcontractor
 * portal / lead marketplace / lawn-care surface never creeps back in.
 *
 * Run: npx tsx scripts/verify-cabinet-only.ts
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const failures: string[] = [];

/** Directories/files that must stay deleted. */
const FORBIDDEN_PATHS = [
  "app/subcontractor",
  "app/partner",
  "app/admin/contractors",
  "app/admin/contracts",
  "app/api/quotes",
  "app/api/create-payment-intent",
  "app/api/create-bulk-payment-intent",
  "app/api/admin/subcontractors",
  "app/api/admin/resolve-payment",
  "app/api/cron/lead-price-updates",
  "app/api/cron/admin-lead-reminders",
  "app/api/leads/[leadId]/purchase",
  "app/api/leads/[leadId]/decline",
  "app/api/leads/[leadId]/watch",
  "app/api/leads/[leadId]/unwatch",
  "app/api/leads/watchlist",
  "app/api/leads/bulk-purchase",
  "components/subcontractor",
  "components/StripePaymentForm.tsx",
  "components/portal/PartnerNav.tsx",
  "components/portal/SubcontractorNav.tsx",
  "components/admin/AdminSubcontractorPanel.tsx",
  "lib/leadCsv.ts",
  "server/services/leadPriceUpdates.ts",
];

for (const rel of FORBIDDEN_PATHS) {
  if (fs.existsSync(path.join(ROOT, rel))) {
    failures.push(`Forbidden path still exists: ${rel}`);
  }
}

/** Source roots scanned for shipped (non-doc) code. */
const SCAN_DIRS = ["app", "components", "shared", "server", "lib", "hooks"];
const SCAN_EXTENSIONS = new Set([".ts", ".tsx"]);

/**
 * Lawn-care vocabulary that must never appear in shipped copy/code.
 *
 * The risk this guards is that boisecabinet.co reads as though it still sells
 * lawn care, so the terms are matched in SERVICE context. Two of them used to
 * be matched as bare words and fired on legitimate cabinet copy: a garage
 * organization article that names a "lawn and garden zone" for storing yard
 * tools and fertilizers. Garage storage is core cabinet content, so that
 * collision recurs by design - and while the guard was red on `main` it
 * reported nothing at all, which is strictly worse than a narrower rule.
 *
 * "lawn" is still matched on its own (a bare "Lawn" nav item would fail); only
 * the storage idiom "lawn and garden" is excluded. Mowing, aeration, weed
 * control, snow removal and sprinklers stay bare words - none of them has an
 * innocent reading on a cabinet site.
 */
const LAWN_TERMS: RegExp[] = [
  /\blawn\b(?!\s*(?:and|&)\s*garden)/i,
  /\bmowing\b/i,
  /\bmow\b/i,
  /\bfertilizing\b/i,
  /\bfertilization\b/i,
  /\bfertilizer\s+(?:service|program|application|treatment|schedule)/i,
  /\baeration\b/i,
  /\bweed control\b/i,
  /\bsnow removal\b/i,
  /\bsprinkler/i,
  /\byardbook\b/i,
];

/**
 * Proof the guard still bites. Each string is something that must FAIL; if any
 * stops matching, the rules above have been loosened past the point of use and
 * this script says so instead of quietly passing everything.
 */
const MUST_STILL_FAIL = [
  "Lawn Care",
  "lawn care services in Boise",
  "Lawn",
  "weekly mowing",
  "we mow and edge",
  "fertilizing program",
  "lawn fertilization",
  "fertilizer application",
  "core aeration",
  "weed control",
  "snow removal",
  "sprinkler blowout",
  "yardbook",
];
for (const sample of MUST_STILL_FAIL) {
  if (!LAWN_TERMS.some((re) => re.test(sample))) {
    failures.push(`Guard self-test: "${sample}" no longer trips any lawn-care rule`);
  }
}

/** And the legitimate cabinet copy that must NOT trip it. */
const MUST_NOT_FAIL = [
  "a lawn and garden zone keeps yard tools, fertilizers, and equipment in one place",
  "vehicles, tools, sports gear, seasonal items, lawn and garden equipment",
  "a lawn & garden zone near the yard door",
];
for (const sample of MUST_NOT_FAIL) {
  const hit = LAWN_TERMS.find((re) => re.test(sample));
  if (hit) {
    failures.push(`Guard self-test: legitimate storage copy trips ${hit} - "${sample}"`);
  }
}

/** Links into the removed portal that must not be referenced from shipped UI. */
const FORBIDDEN_LINKS: RegExp[] = [
  /["'`]\/subcontractor(\/[^"'`]*)?["'`]/,
  /["'`]\/partner(\/[^"'`]*)?["'`]/,
];

function walk(dir: string, visit: (file: string) => void) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, visit);
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      visit(full);
    }
  }
}

for (const dirRel of SCAN_DIRS) {
  const dir = path.join(ROOT, dirRel);
  if (!fs.existsSync(dir)) continue;
  walk(dir, (file) => {
    // The next.config redirect map intentionally references the legacy paths to
    // 301 them home; it is scanned separately and excluded here.
    const text = fs.readFileSync(file, "utf8");
    const relFile = path.relative(ROOT, file);

    for (const re of LAWN_TERMS) {
      if (re.test(text)) {
        failures.push(`${relFile}: lawn-care term ${re}`);
      }
    }
    for (const re of FORBIDDEN_LINKS) {
      if (re.test(text)) {
        failures.push(`${relFile}: link to removed portal ${re}`);
      }
    }
  });
}

if (failures.length === 0) {
  console.log("✅ Cabinet-only guard passed: no lawn-care, no subcontractor portal, no lead marketplace.");
  process.exit(0);
}

console.error("❌ Cabinet-only guard failed:\n");
for (const f of failures) console.error(`  - ${f}`);
process.exit(1);
