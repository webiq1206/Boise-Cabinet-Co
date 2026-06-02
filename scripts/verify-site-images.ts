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
  for (const entry of manifest.entries) {
    if (!entry.alt || entry.alt.length < 20) {
      errors.push(`Manifest alt too short: ${entry.id}`);
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
