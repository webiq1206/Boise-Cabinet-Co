/**
 * Site-wide image verification — blog registry + manifest + placeholder detection.
 * Run: npm run verify:images
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = path.join(__dirname, "..");
const errors: string[] = [];
const warnings: string[] = [];

// Run existing blog image checks
try {
  execSync("npx tsx scripts/verify-blog-images.ts", { stdio: "pipe", cwd: root });
} catch (e) {
  const out = e instanceof Error && "stdout" in e ? String((e as { stdout: Buffer }).stdout) : "";
  errors.push(`Blog image verification failed:\n${out}`);
}

const manifestPath = path.join(root, "scripts", "site-image-manifest.json");
if (!fs.existsSync(manifestPath)) {
  errors.push("Missing scripts/site-image-manifest.json — run node scripts/build-site-image-manifest.mjs");
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // Alt-quality audit: every non-decorative image must localize us and contain
  // the business name. Locale is checked with the brand removed so "Boise"
  // inside "Boise Cabinet Co" does not satisfy the requirement on its own.
  const BRAND = "Boise Cabinet Co";
  const LOCALE_TOKENS = [
    "Treasure Valley", "Idaho", "Boise", "Meridian", "Eagle", "Nampa",
    "Kuna", "Star", "Middleton", "Caldwell", "Ada County", "Canyon County",
  ];
  const altCounts = new Map<string, number>();

  for (const entry of manifest.entries) {
    if (!entry.alt || entry.alt.length < 20) {
      errors.push(`Manifest alt too short: ${entry.id}`);
    }
    if (entry.alt && !entry.decorative) {
      if (!entry.alt.includes(BRAND)) {
        errors.push(`Alt missing business name "${BRAND}": ${entry.id}`);
      }
      const sansBrand = entry.alt.split(BRAND).join(" ");
      if (!LOCALE_TOKENS.some((t) => sansBrand.includes(t))) {
        errors.push(`Alt missing a locale token: ${entry.id} ("${entry.alt}")`);
      }
      altCounts.set(entry.alt, (altCounts.get(entry.alt) ?? 0) + 1);
    }
    const filePath = path.join(root, "public", entry.outputPath.replace(/^\//, ""));
    const pngFallback = filePath.replace(/\.webp$/, ".png");
    if (!fs.existsSync(filePath) && !fs.existsSync(pngFallback)) {
      if (entry.priority === "critical" || entry.priority === "high") {
        warnings.push(`Missing asset: ${entry.outputPath} (${entry.id})`);
      }
    }
    if (fs.existsSync(filePath)) {
      const head = fs.readFileSync(filePath).subarray(0, 20).toString("utf8");
      if (head.includes("<?xml") || head.includes("<svg")) {
        errors.push(`Placeholder SVG content in ${entry.outputPath}`);
      }
    }
  }

  // Flag alts reused across many images (thin/duplicate alt text hurts SEO).
  const MAX_ALT_REUSE = 3;
  for (const [alt, n] of altCounts) {
    if (n > MAX_ALT_REUSE) {
      errors.push(`Alt reused ${n} times (max ${MAX_ALT_REUSE}): "${alt}"`);
    }
  }
}

// Orphan legacy SVG placeholders (warn only)
const orphanSvgDirs = ["public/images/gallery"];
for (const rel of orphanSvgDirs) {
  const dir = path.join(root, rel);
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".svg")) {
        warnings.push(`Orphan placeholder SVG still present: ${rel}/${f}`);
      }
    }
  }
}

console.log("\n=== Site Image Verification ===\n");
if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  warnings.slice(0, 20).forEach((w) => console.log(`  ⚠ ${w}`));
  if (warnings.length > 20) console.log(`  ... and ${warnings.length - 20} more`);
}
if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  process.exit(1);
}
console.log("\n✓ Site image verification passed.\n");
