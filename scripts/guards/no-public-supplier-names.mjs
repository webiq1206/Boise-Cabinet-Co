/**
 * Postbuild guard. Fails when a supplier term or a seed review name is served
 * in the production build output.
 *
 * Scans file paths under .next/static and public/, the text content of
 * .next/static, rendered .next/server/app files, public text, PDF text, image
 * metadata, MP4 metadata, and .next/server/chunks. Skips .next/cache and standalone/node_modules.
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
const VIDEO_EXT = new Set([".mp4", ".m4v", ".mov"]);

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

/** Read bounded ISO BMFF boxes; never recover by ignoring an invalid tail. */
function videoBoxes(buffer, start = 0, end = buffer.length) {
  const boxes = [];
  for (let offset = start; offset < end;) {
    if (end - offset < 8) throw new Error("truncated box header");
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString("latin1", offset + 4, offset + 8);
    let header = 8;
    if (size === 1) {
      if (end - offset < 16) throw new Error("truncated extended box header");
      const extended = buffer.readBigUInt64BE(offset + 8);
      if (extended > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("unsafe box size");
      size = Number(extended);
      header = 16;
    } else if (size === 0) size = end - offset;
    if (size < header || size > end - offset) throw new Error(`invalid ${JSON.stringify(type)} box size`);
    boxes.push({ type, start: offset, payload: offset + header, end: offset + size });
    offset += size;
  }
  return boxes;
}

function onlyVideoBox(boxes, type) {
  const matches = boxes.filter((box) => box.type === type);
  if (matches.length !== 1) throw new Error(`expected one ${type} box`);
  return matches[0];
}

function validateAvcConfiguration(value) {
  if (value.length < 7 || value[0] !== 1 || (value[4] & 0xfc) !== 0xfc || (value[5] & 0xe0) !== 0xe0 || (value[4] & 3) === 2) {
    throw new Error("invalid AVC configuration");
  }
  let offset = 6;
  function parameters(count, nalType) {
    for (let index = 0; index < count; index++) {
      if (offset + 2 > value.length) throw new Error("truncated AVC parameter length");
      const length = value.readUInt16BE(offset);
      offset += 2;
      if (length === 0 || length > value.length - offset || (value[offset] & 0x9f) !== nalType) throw new Error("invalid AVC parameter");
      offset += length;
    }
  }
  const spsCount = value[5] & 0x1f;
  if (spsCount === 0) throw new Error("missing AVC sequence parameters");
  parameters(spsCount, 7);
  if (offset >= value.length) throw new Error("missing AVC picture parameters");
  const ppsCount = value[offset++];
  if (ppsCount === 0) throw new Error("missing AVC picture parameters");
  parameters(ppsCount, 8);
  if (offset < value.length) {
    // High-profile records may include chroma/bit-depth fields and SPS extensions.
    if (![100, 110, 122, 144].includes(value[1]) || value.length - offset < 4 ||
        (value[offset] & 0xfc) !== 0xfc || (value[offset + 1] & 0xf8) !== 0xf8 || (value[offset + 2] & 0xf8) !== 0xf8) {
      throw new Error("unsupported AVC configuration extension");
    }
    offset += 3;
    parameters(value[offset++], 13);
  }
  if (offset !== value.length) throw new Error("trailing AVC configuration bytes");
}

function videoText(file) {
  const buffer = fs.readFileSync(file);
  const boxes = videoBoxes(buffer);
  const children = (box, skip = 0) => {
    if (box.end - box.payload < skip) throw new Error(`truncated ${box.type} box`);
    return videoBoxes(buffer, box.payload + skip, box.end);
  };
  const ftyp = onlyVideoBox(boxes, "ftyp");
  if (ftyp.end - ftyp.payload < 8 || (ftyp.end - ftyp.payload) % 4 !== 0) throw new Error("invalid file type box");
  const brands = [buffer.toString("latin1", ftyp.payload, ftyp.payload + 4)];
  for (let offset = ftyp.payload + 8; offset < ftyp.end; offset += 4) brands.push(buffer.toString("latin1", offset, offset + 4));
  if (!brands.some((brand) => /^(isom|iso[2-6]|mp4[12]|avc1|M4V |qt  )$/.test(brand))) throw new Error("unrecognized video file type");

  const movie = onlyVideoBox(boxes, "moov");
  const tracks = children(movie).filter((box) => box.type === "trak");
  const parts = [];
  if (tracks.length === 0 || !boxes.some((box) => box.type === "mdat")) throw new Error("missing video tracks or media data");
  for (const track of tracks) {
    const media = onlyVideoBox(children(track), "mdia");
    const mediaChildren = children(media);
    const handler = onlyVideoBox(mediaChildren, "hdlr");
    if (handler.end - handler.payload < 24) throw new Error("truncated track handler");
    const type = buffer.toString("latin1", handler.payload + 8, handler.payload + 12);
    // This deliberately supports only AVC video. Text/subtitle, encrypted,
    // audio, and unknown tracks need an extractor before their samples may be skipped.
    if (type !== "vide") throw new Error(`unsupported track handler ${JSON.stringify(type)}`);
    const info = onlyVideoBox(mediaChildren, "minf");
    const table = onlyVideoBox(children(info), "stbl");
    const description = onlyVideoBox(children(table), "stsd");
    if (description.end - description.payload < 8 || buffer.readUInt32BE(description.payload) !== 0) throw new Error("invalid sample description");
    const entries = children(description, 8);
    if (entries.length === 0 || entries.length !== buffer.readUInt32BE(description.payload + 4)) throw new Error("invalid sample description count");
    for (const entry of entries) {
      if (entry.type !== "avc1" && entry.type !== "avc3") throw new Error(`unsupported video sample ${JSON.stringify(entry.type)}`);
      // VisualSampleEntry has a 78-byte fixed header before its child boxes.
      const config = onlyVideoBox(children(entry, 78), "avcC");
      validateAvcConfiguration(buffer.subarray(config.payload, config.end));
      const nameLength = buffer[entry.payload + 42];
      if (nameLength > 31) throw new Error("invalid compressor name length");
      parts.push(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(entry.payload + 43, entry.payload + 43 + nameLength)));
    }
  }

  const containers = new Set(["moov", "trak", "mdia", "minf", "stbl", "edts", "dinf", "udta"]);
  function metadata(items, depth = 0) {
    if (depth > 32) throw new Error("video metadata nesting limit exceeded");
    for (const box of items) {
      if (["cmov", "moof", "mvex"].includes(box.type)) throw new Error(`unsupported ${box.type} video layout`);
      if (containers.has(box.type)) metadata(children(box), depth + 1);
      else if (box.type === "meta") {
        if (box.end - box.payload < 4 || buffer.readUInt32BE(box.payload) !== 0) throw new Error("unsupported metadata header");
        metadata(children(box, 4), depth + 1);
      } else if (box.type === "ilst") {
        for (const item of children(box)) metadata(children(item), depth + 1);
      } else if (box.type === "data") {
        if (box.end - box.payload < 8) throw new Error("truncated metadata value");
        const kind = buffer.readUInt32BE(box.payload);
        const value = buffer.subarray(box.payload + 8, box.end);
        if (kind !== 1 && kind !== 2) throw new Error(`unsupported metadata value type ${kind}`);
        parts.push(new TextDecoder(kind === 2 ? "utf-16be" : "utf-8", { fatal: true }).decode(value));
      } else if (box.type.startsWith("\xa9")) {
        // Legacy QuickTime user-data text has a different framing/encoding.
        // It needs an extractor before it can be accepted as scanned metadata.
        throw new Error("unsupported legacy QuickTime text metadata");
      } else if (box.type === "hdlr") {
        if (box.end - box.payload < 24) throw new Error("truncated metadata handler");
        parts.push(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(box.payload + 24, box.end)));
      }
    }
  }
  metadata(boxes);
  // Preserve the conservative scan of every other byte, including unknown
  // metadata, handler names, free/uuid boxes, and nested boxes named mdat.
  // Only validated top-level media samples are compressed video, not text.
  for (const box of boxes) if (box.type !== "mdat") parts.push(printableRuns(buffer.subarray(box.start, box.end)));
  return parts.join("\n");
}

function scanVideo(file) {
  try {
    record(file, videoText(file));
  } catch (error) {
    hits.push(`${rel(file)}: unreadable video (${error instanceof Error ? error.message : String(error)})`);
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
    if (VIDEO_EXT.has(ext)) {
      scanVideo(file);
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
    if (VIDEO_EXT.has(ext)) {
      scanVideo(file);
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
