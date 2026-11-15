/**
 * Render Boise Cabinet Co estimator emails to HTML and PNG.
 * Does not send email.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "@playwright/test";
import {CABINET_EMAIL_FIXTURES, renderCabinetEstimate} from "../tests/cabinet-estimator-email-render.ts";

process.env.P5_LINK_SECRET = "synthetic-link-secret-for-render-only";

const out = process.env.EMAIL_RENDER_OUT || "/opt/cursor/artifacts/emails";
mkdirSync(out, {recursive: true});

function writeRetry(file: string, data: string | Buffer) {
  let last: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      writeFileSync(file, data);
      return;
    } catch (error) {
      last = error;
      const code = typeof error === "object" && error && "code" in error ? String((error as {code?: unknown}).code) : "";
      if (code !== "EAGAIN") throw error;
    }
  }
  throw last;
}

const browser = await chromium.launch();
const page = await browser.newPage();
const written: string[] = [];

for (const fixture of CABINET_EMAIL_FIXTURES) {
  const rendered = renderCabinetEstimate(fixture);
  for (const kind of ["admin", "customer"] as const) {
    const message = rendered[kind];
    const htmlPath = path.join(out, `${fixture.id}-${kind}.html`);
    writeRetry(htmlPath, message.html);
    writeRetry(path.join(out, `${fixture.id}-${kind}.txt`), message.text);
    written.push(htmlPath);
    for (const width of [1280, 375]) {
      await page.setViewportSize({width, height: 900});
      await page.setContent(message.html, {waitUntil: "load"});
      const png = path.join(out, `${fixture.id}-${kind}-${width}.png`);
      writeRetry(png, await page.screenshot({fullPage: true}));
      written.push(png);
    }
  }
}

await browser.close();
console.log(written.join("\n"));
