import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import terms from "../scripts/guards/supplier-terms.json";

test.describe.configure({ timeout: 180_000 });

const ROUTES = ["/construction", "/installer"] as const;

function seedNames(): string[] {
  const source = readFileSync(join(process.cwd(), "tests/hide-seed-testimonials.test.ts"), "utf8");
  const match = source.match(/const NAMES = (\[[\s\S]*?\]);/);
  if (!match) throw new Error("seed names missing from tests/hide-seed-testimonials.test.ts");
  return JSON.parse(match[1]) as string[];
}

test("construction and installer render no supplier names", async ({ page }) => {
  const names = seedNames();
  for (const path of ROUTES) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), path).toBeTruthy();
    let html = await response!.text();
    for (const phrase of terms.allowlist) html = html.split(phrase).join(" ".repeat(phrase.length));
    for (const term of terms.terms) {
      expect(html, `${path} ${term}`).not.toMatch(new RegExp(term, "i"));
    }
    for (const name of names) expect(html, path).not.toContain(name);
  }
});
