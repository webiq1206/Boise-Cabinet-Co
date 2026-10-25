import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEAL_URL = "/brand/svg/seal/";

function htmlFiles(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) htmlFiles(full, found);
    else if (name.endsWith(".html")) found.push(full);
  }
  return found;
}

test("built HTML has no seal URL when SHOW_FOUNDING_YEAR is off", () => {
  const appDir = path.join(root, ".next/server/app");
  const files = htmlFiles(appDir);
  assert.ok(files.length > 0, "expected prerendered HTML under .next/server/app");

  const hits: string[] = [];
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    if (html.includes(SEAL_URL) || html.includes("boise-cabinet-co-seal")) hits.push(path.relative(root, file));
  }
  assert.deepEqual(hits, []);

  const aboutFile = files.find((file) => /[/\\]about(?:[/\\]index)?\.html$/.test(file));
  const missingFile = files.find((file) => file.includes("not-found") && file.endsWith(".html"));
  assert.ok(aboutFile, "about HTML");
  assert.ok(missingFile, "not-found HTML");
  const about = readFileSync(aboutFile, "utf8");
  const missing = readFileSync(missingFile, "utf8");
  assert.match(about, /\/brand\/svg\/icon\/boise-cabinet-co-icon-bone\.svg/);
  assert.match(missing, /\/brand\/svg\/icon\/boise-cabinet-co-icon-bone\.svg/);
  assert.match(about, /alt="Boise Cabinet Co"/);
  assert.match(missing, /alt="Boise Cabinet Co"/);
});
