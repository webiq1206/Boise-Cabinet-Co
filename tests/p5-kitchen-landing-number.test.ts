import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import KitchenCabinetsPage, { metadata as landingMetadata } from "../app/kitchen-cabinets/page.tsx";
import { ConditionalFooter } from "../components/ConditionalFooter.tsx";
import { Footer } from "../components/Footer.tsx";
import { ApprovedHome } from "../components/approved/ApprovedHome.tsx";
import { HOMEPAGE_DESCRIPTION } from "../lib/seo.ts";
import { BOT05_ROOMS } from "../shared/content/bot05PageCopy.ts";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function renderFooterAt(pathname: string) {
  return renderToStaticMarkup(
    React.createElement(
      PathnameContext.Provider,
      { value: pathname },
      React.createElement(ConditionalFooter, {
        footer: React.createElement(Footer),
      }),
    ),
  );
}

function metaTags(description: string) {
  return `<meta name="description" content="${description}"><meta property="og:description" content="${description}">`;
}

/** JSON-LD may keep the registration identifier. Visible copy and meta may not. */
function outsideJsonLd(html: string) {
  return html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "");
}

test("kitchen ad landing html omits 8381215 outside json-ld while home and kitchen pages keep it", () => {
  const description = typeof landingMetadata.description === "string" ? landingMetadata.description : "";
  const og = landingMetadata.openGraph?.description;
  const ogText = typeof og === "string" ? og : "";
  const pageHtml = renderToStaticMarkup(React.createElement(KitchenCabinetsPage));
  const jsonLd = pageHtml.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi)?.join("\n") ?? "";
  const landing = outsideJsonLd(metaTags(description) + metaTags(ogText) + pageHtml + renderFooterAt("/kitchen-cabinets"));
  assert.equal(landing.includes("8381215"), false);
  assert.match(jsonLd, /8381215/);
  assert.equal(description.includes("8381215"), false);
  assert.equal(ogText.includes("8381215"), false);
  assert.equal(description, "Kitchen cabinets, bathroom vanities and built-ins in Boise. Call or text (208) 477-1169.");
  assert.equal(ogText, description);
  assert.equal(description.includes("\u2014"), false);
  assert.equal(description.includes("\u2013"), false);

  const home = outsideJsonLd(
    metaTags(HOMEPAGE_DESCRIPTION) +
      renderToStaticMarkup(React.createElement(ApprovedHome)) +
      renderFooterAt("/"),
  );
  assert.match(home, /8381215/);

  const kitchen = outsideJsonLd(
    `<p>${BOT05_ROOMS.kitchen.trustLine}</p>` + renderFooterAt("/cabinets/kitchen"),
  );
  assert.match(kitchen, /8381215/);
});
