/**
 * Postbuild guard. Fails when a supplier term or a seed review name is served
 * in the production build output.
 *
 * Scans file paths under .next/static and public/, the text content of
 * .next/static, rendered .next/server/app files, public text, PDF text, image
 * metadata, and .next/server/chunks. Skips .next/cache and standalone/node_modules.
 */
import fs from "node:fs";
import path from "node:path";
import { findHits, loadTerms, printableRuns, ROOT, snippet } from "./supplier-scan.mjs";

const APP_EXT = new Set([".html", ".rsc", ".body", ".meta", ".json"]);
const TEXT_EXT = new Set([
  ".js", ".mjs", ".cjs", ".css", ".map", ".json", ".html", ".htm", ".txt", ".svg",
  ".xml", ".rsc", ".body", ".meta", ".webmanifest", ".csv", ".md",
]);
const IMAGE_EXT = new Set([".webp", ".png", ".jpg", ".jpeg", ".gif", ".avif", ".ico"]);

const rules = loadTerms();
const hits = [];

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function excluded(file) {
  const name = rel(file);
  return name.includes("node_modules") || name.includes(".next/cache") || name.includes("standalone/node_modules");
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules") continue;
    const full = path.join(dir, name);
    if (excluded(full)) continue;
    if (name === "cache" && path.basename(dir) === ".next") continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (stat.isFile()) out.push(full);
  }
  return out;
}

function record(file, text) {
  const where = rel(file);
  for (const hit of findHits(text, rules)) {
    hits.push(`${where}: ${hit.kind} ${JSON.stringify(snippet(text, hit.index, hit.match))}`);
  }
}

function readText(file) {
  return fs.readFileSync(file).toString("utf8");
}

async function pdfText(file) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(file));
  const task = getDocument({ data, useSystemFonts: true, disableFontFace: true, isEvalSupported: false });
  const doc = await task.promise;
  const parts = [];
  try {
    const meta = await doc.getMetadata();
    if (meta?.info) parts.push(JSON.stringify(meta.info));
    if (typeof meta?.metadata?.getRaw === "function") parts.push(String(meta.metadata.getRaw()));
  } catch (error) {
    throw new Error(`pdf metadata unreadable: ${error instanceof Error ? error.message : String(error)}`);
  }
  for (let index = 1; index <= doc.numPages; index++) {
    const page = await doc.getPage(index);
    const content = await page.getTextContent();
    parts.push(content.items.map((item) => ("str" in item ? item.str : "") || "").join(" "));
    page.cleanup();
  }
  await task.destroy();
  return parts.join("\n");
}

async function imageMetadata(file) {
  const sharp = (await import("sharp")).default;
  const meta = await sharp(file, { failOn: "none" }).metadata();
  const parts = [];
  for (const value of Object.values(meta)) {
    if (Buffer.isBuffer(value)) parts.push(value.toString("utf8"));
    else if (value != null) parts.push(typeof value === "string" ? value : JSON.stringify(value));
  }
  return parts.join("\n");
}

async function imageText(file) {
  try {
    return await imageMetadata(file);
  } catch {
    // Sharp cannot decode every icon container. Printable runs still catch a name in the file.
    return printableRuns(fs.readFileSync(file));
  }
}

function scanPaths(files) {
  for (const file of files) record(file, rel(file));
}

async function scanStatic(files) {
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (TEXT_EXT.has(ext)) {
      record(file, readText(file));
      continue;
    }
    if (IMAGE_EXT.has(ext)) {
      record(file, await imageText(file));
      continue;
    }
    record(file, printableRuns(fs.readFileSync(file)));
  }
}

async function scanPublic(files) {
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === ".pdf") {
      try {
        record(file, await pdfText(file));
      } catch (error) {
        hits.push(`${rel(file)}: unreadable pdf (${error instanceof Error ? error.message : String(error)})`);
      }
      continue;
    }
    if (IMAGE_EXT.has(ext)) {
      record(file, await imageText(file));
      continue;
    }
    if (TEXT_EXT.has(ext) || ext === "") {
      record(file, readText(file));
      continue;
    }
    record(file, printableRuns(fs.readFileSync(file)));
  }
}

function requireDir(dir) {
  if (!fs.existsSync(dir)) {
    hits.push(`${rel(dir)}: missing build output`);
  }
}

const staticDirs = [path.join(ROOT, ".next/static"), path.join(ROOT, ".next/standalone/.next/static")];
const appDirs = [path.join(ROOT, ".next/server/app"), path.join(ROOT, ".next/standalone/.next/server/app")];
const chunkDirs = [path.join(ROOT, ".next/server/chunks"), path.join(ROOT, ".next/standalone/.next/server/chunks")];
const publicDirs = [path.join(ROOT, "public"), path.join(ROOT, ".next/standalone/public")];

requireDir(path.join(ROOT, ".next/static"));
requireDir(path.join(ROOT, ".next/server/app"));
requireDir(path.join(ROOT, ".next/server/chunks"));
requireDir(path.join(ROOT, "public"));

const staticFiles = staticDirs.flatMap((dir) => walk(dir));
const appFiles = appDirs.flatMap((dir) => walk(dir)).filter((file) => APP_EXT.has(path.extname(file).toLowerCase()));
const chunkFiles = chunkDirs.flatMap((dir) => walk(dir));
const publicFiles = publicDirs.flatMap((dir) => walk(dir));

scanPaths(staticFiles.filter((file) => rel(file).includes(".next/static")));
scanPaths(publicFiles);
await scanStatic(staticFiles);
for (const file of appFiles) record(file, readText(file));
for (const file of chunkFiles) {
  const ext = path.extname(file).toLowerCase();
  record(file, TEXT_EXT.has(ext) || ext === "" ? readText(file) : printableRuns(fs.readFileSync(file)));
}
await scanPublic(publicFiles);

const unique = [...new Set(hits)];
if (unique.length === 0) {
  console.log("no-public-supplier-names");
  console.log("0 hits");
  process.exit(0);
}
console.error("no-public-supplier-names");
console.error(`${unique.length} hits`);
for (const line of unique.slice(0, 200)) console.error(line);
if (unique.length > 200) console.error(`... ${unique.length - 200} more`);
process.exit(1);
