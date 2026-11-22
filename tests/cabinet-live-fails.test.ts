import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import KitchenCabinetsPage from "../app/kitchen-cabinets/page.tsx";
import RoomCabinetPage from "../app/cabinets/[room]/page.tsx";
import { Footer } from "../components/Footer.tsx";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function visible(html: string) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
}

function jsonLd(html: string) {
  return [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .join("\n");
}

test("kitchen landing visible HTML drops the contractor number and schema keeps it", () => {
  const page = renderToStaticMarkup(React.createElement(KitchenCabinetsPage));
  const footer = renderToStaticMarkup(React.createElement(Footer, { hideRegistration: true }));
  const html = visible(page + footer);
  assert.equal(html.includes("8381215"), false);
  assert.match(html, /Registered and insured\./);
  assert.match(jsonLd(page), /8381215/);
  const elsewhere = renderToStaticMarkup(React.createElement(Footer));
  assert.match(elsewhere, /8381215/);
});

test("pantry page visible HTML has no warranty wording and keeps the help link", async () => {
  const page = await RoomCabinetPage({ params: Promise.resolve({ room: "pantry" }) });
  const footer = renderToStaticMarkup(React.createElement(Footer, { hideWarrantyLink: true }));
  const html = visible(renderToStaticMarkup(page) + footer);
  const withoutHelpHref = html.replace(/href="\/warranty#get-help"/g, "");
  assert.equal(/warrant/i.test(withoutHelpHref), false);
  assert.match(html, /Get help/);
  assert.match(html, /href="\/warranty#get-help"/);
  assert.doesNotMatch(html, />Warranty</);
  const elsewhere = renderToStaticMarkup(React.createElement(Footer));
  assert.match(elsewhere, />Warranty</);
});

test("kitchen and pantry routes stay static", () => {
  const layout = readFileSync("app/layout.tsx", "utf8");
  const middleware = readFileSync("middleware.ts", "utf8");
  assert.equal(layout.includes("headers("), false);
  assert.equal(layout.includes("x-pathname"), false);
  assert.equal(middleware.includes("x-pathname"), false);
  assert.equal(middleware.includes("/kitchen-cabinets"), false);
  assert.equal(middleware.includes("/cabinets/pantry"), false);
  for (const file of ["app/kitchen-cabinets/page.tsx", "app/cabinets/[room]/page.tsx", "app/layout.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.equal(/export const dynamic\s*=/.test(source), false, file);
  }
  const footer = readFileSync("components/family/SiteFooter.tsx", "utf8");
  assert.equal(footer.includes("hideSupportLinks"), false);
  assert.equal(footer.includes("omitHrefs"), false);
});
