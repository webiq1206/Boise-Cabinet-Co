import assert from "node:assert/strict";
import { writeFileSync, unlinkSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as esbuild from "esbuild";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);

const BANNED = [
  "cabinetmaker",
  "cnc",
  "skilled craftsmen",
  "we build",
  "what we build",
  "built to order",
  "fabrication",
];

async function renderAboutHtml() {
  const built = await esbuild.build({
    absWorkingDir: root,
    entryPoints: ["app/about/page.tsx"],
    bundle: true,
    format: "cjs",
    platform: "node",
    jsx: "automatic",
    packages: "external",
    write: false,
    alias: { "@": root },
    plugins: [
      {
        name: "css-stub",
        setup(build) {
          build.onResolve({ filter: /\.css$/ }, (args) => ({
            path: args.path,
            namespace: "css-stub",
          }));
          build.onLoad({ filter: /.*/, namespace: "css-stub" }, () => ({
            contents: "module.exports = {};",
            loader: "js",
          }));
        },
      },
    ],
  });
  const outfile = path.join(root, "tests", ".about-page-render.cjs");
  writeFileSync(outfile, built.outputFiles[0].text);
  try {
    const AboutPage = require(outfile).default;
    return renderToStaticMarkup(React.createElement(AboutPage));
  } finally {
    unlinkSync(outfile);
  }
}

test("rendered /about HTML does not claim that P5 builds cabinets", async () => {
  const html = await renderAboutHtml();
  const visible = html.toLowerCase();
  for (const phrase of BANNED) {
    assert.equal(
      visible.includes(phrase),
      false,
      `rendered /about HTML still contains "${phrase}"`,
    );
  }
  const decoded = html.replace(/&amp;/g, "&").replace(/%2F/gi, "/");
  assert.match(decoded, /We design, source, and install custom kitchen/);
  assert.match(decoded, /Kitchen combining charcoal cabinetry, a white oak island, and ivory stone/);
  assert.match(decoded, /Cabinet door samples, finish swatches, and a kitchen layout rendering/);
  assert.match(decoded, /\/images\/approved\/kitchen-charcoal\.webp/);
  assert.match(decoded, /\/images\/marketing\/hero-design-studio\.webp/);
});
