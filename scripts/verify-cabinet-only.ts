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

/** Lawn-care vocabulary that must never appear in shipped copy/code. */
const LAWN_TERMS: RegExp[] = [
  /\blawn\b/i,
  /\bmowing\b/i,
  /\bmow\b/i,
  /\bfertiliz/i,
  /\baeration\b/i,
  /\bweed control\b/i,
  /\bsnow removal\b/i,
  /\bsprinkler/i,
  /\byardbook\b/i,
];

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
