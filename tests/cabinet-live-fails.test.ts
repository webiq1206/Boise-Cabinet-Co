import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import KitchenCabinetsPage from "../app/kitchen-cabinets/page.tsx";
import RoomCabinetPage from "../app/cabinets/[room]/page.tsx";
import { Footer, footerFlags } from "../components/Footer.tsx";
import { generateOrganizationSchema } from "../lib/schema.ts";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function visible(html: string) {
  return html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "");
}

test("kitchen landing visible HTML drops the contractor number and schema keeps it", async () => {
  const page = renderToStaticMarkup(React.createElement(KitchenCabinetsPage));
  const flags = footerFlags("/kitchen-cabinets");
  const footer = renderToStaticMarkup(React.createElement(Footer, flags));
  const html = visible(page + footer);
  assert.equal(html.includes("8381215"), false);
  assert.match(html, /Registered and insured\./);
  assert.match(JSON.stringify(generateOrganizationSchema()), /8381215/);
  const elsewhere = renderToStaticMarkup(React.createElement(Footer));
  assert.match(elsewhere, /8381215/);
});

test("pantry page visible HTML has no warranty wording", async () => {
  const page = await RoomCabinetPage({ params: Promise.resolve({ room: "pantry" }) });
  const flags = footerFlags("/cabinets/pantry");
  const footer = renderToStaticMarkup(React.createElement(Footer, flags));
  const html = visible(renderToStaticMarkup(page) + footer);
  assert.equal(/warrant/i.test(html), false);
  const elsewhere = renderToStaticMarkup(React.createElement(Footer));
  assert.match(elsewhere, /Warranty/);
});
