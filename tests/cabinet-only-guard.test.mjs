import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const require = createRequire(import.meta.url);
const script = readFileSync(new URL("../scripts/verify-cabinet-only.ts", import.meta.url), "utf8");

function check(files) {
  const root = mkdtempSync(path.join(tmpdir(), "cabinet-service-guard-"));
  try {
    const fixture = { "scripts/verify-cabinet-only.ts": script, ...files };
    for (const [file, text] of Object.entries(fixture)) {
      const destination = path.join(root, file);
      mkdirSync(path.dirname(destination), { recursive: true });
      writeFileSync(destination, text);
    }
    return spawnSync(process.execPath, ["--import", require.resolve("tsx"), path.join(root, "scripts/verify-cabinet-only.ts")], {
      encoding: "utf8",
      timeout: 30000,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("shared reference data is not Cabinet service advertising", () => {
  const result = check({
    "lib/p5/priceBookData.ts": 'export const rows = ["Fire sprinkler design", "Concrete curb / mow strip", "Job-site snow removal"];',
    "lib/p5/tradeVocabulary.ts": 'export const synonyms = [["sprinkler", "irrigation", "lawn sprinkler"]];',
    "app/page.tsx": 'export const copy = "Garage cabinets for lawn and garden equipment";',
  });
  assert.equal(result.status, 0, result.stderr);
});

test("Cabinet service copy still rejects lawn services outside the exact data files", () => {
  for (const file of ["app/page.tsx", "components/Services.tsx", "lib/p5/newService.ts", "lib/p5/priceBookData.tsx"]) {
    const result = check({ [file]: 'export const copy = "Lawn care, weekly mowing and sprinkler blowout";' });
    assert.equal(result.status, 1, `${file}: ${result.stderr}`);
    assert.match(result.stderr, /lawn-care term/);
  }
});

test("shared data exemptions do not permit retired portal links", () => {
  for (const file of ["lib/p5/priceBookData.ts", "lib/p5/tradeVocabulary.ts"]) {
    const result = check({ [file]: 'export const link = "/subcontractor";' });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /link to removed portal/);
  }
});

test("retired portal paths still fail independently of vocabulary", () => {
  const result = check({ "app/partner/page.tsx": 'export const copy = "Cabinets";' });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /Forbidden path still exists: app\/partner/);
});
