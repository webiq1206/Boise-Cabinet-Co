#!/usr/bin/env node
/**
 * Compile the project source(s) into shared/generated/projects.generated.ts.
 *
 * Sources (merged, folder entries win by slug):
 *   1. data/projects.json                      -> `projects` array
 *   2. public/images/projects/<slug>/project.json (optional per-project folders)
 *
 * The generator validates every referenced image, then applies the credibility
 * rules automatically so no site component ever needs hand-editing:
 *   - kind "concept": single completed-look image, no before/after slider ever
 *     (any supplied `before` is dropped).
 *   - kind "verified": before/after slider is emitted ONLY when a real `before`
 *     image exists, `images.sameSpaceBeforeAfter` is true, and the before/after
 *     aspect ratios match within tolerance. Otherwise the after image shows alone.
 *
 * Hard errors (exit 1): missing required field, duplicate slug, invalid kind,
 * missing `after` image. Soft issues (warn): missing alt (falls back to title),
 * missing detail image (skipped), disabled slider.
 *
 * Run: npm run projects:build   (also runs in prebuild / catalog:build)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_PATH = path.join(ROOT, "data/projects.json");
const PROJECT_FOLDERS = path.join(PUBLIC_DIR, "images/projects");
const OUT_PATH = path.join(ROOT, "shared/generated/projects.generated.ts");

const ASPECT_TOLERANCE = 0.06; // 6%
const KINDS = new Set(["concept", "verified"]);

const errors = [];
const warns = [];
const fail = (m) => errors.push(m);
const warn = (m) => warns.push(m);

const publicPathOf = (src) => path.join(PUBLIC_DIR, src.replace(/^\//, ""));
const fileExists = (src) => src && fs.existsSync(publicPathOf(src));

const dimCache = new Map();
async function aspectRatio(src) {
  if (dimCache.has(src)) return dimCache.get(src);
  let ar = null;
  try {
    const meta = await sharp(publicPathOf(src)).metadata();
    if (meta.width && meta.height) ar = meta.width / meta.height;
  } catch {
    ar = null;
  }
  dimCache.set(src, ar);
  return ar;
}

/** Read data/projects.json. */
function readBaseProjects() {
  if (!fs.existsSync(DATA_PATH)) return [];
  const json = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  return Array.isArray(json.projects) ? json.projects : [];
}

/** Discover per-project folders under public/images/projects/<slug>/project.json. */
function readFolderProjects() {
  if (!fs.existsSync(PROJECT_FOLDERS)) return [];
  const out = [];
  for (const entry of fs.readdirSync(PROJECT_FOLDERS, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const dir = path.join(PROJECT_FOLDERS, slug);
    const metaPath = path.join(dir, "project.json");
    if (!fs.existsSync(metaPath)) continue;
    let meta;
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch (e) {
      fail(`projects/${slug}/project.json is not valid JSON: ${e.message}`);
      continue;
    }
    meta.slug = meta.slug || slug;
    meta.images = meta.images || {};
    // Resolve images by convention when not explicitly provided.
    const rel = (f) => `/images/projects/${slug}/${f}`;
    const find = (re) =>
      fs.readdirSync(dir).find((f) => re.test(f));
    const toWeb = (v) =>
      !v ? v : v.startsWith("/") ? v : rel(v);
    if (!meta.images.after) {
      const f = find(/^after\.(webp|png|jpe?g)$/i);
      if (f) meta.images.after = rel(f);
    } else {
      meta.images.after = toWeb(meta.images.after);
    }
    if (!meta.images.before) {
      const f = find(/^before\.(webp|png|jpe?g)$/i);
      if (f) meta.images.before = rel(f);
    } else {
      meta.images.before = toWeb(meta.images.before);
    }
    if (!Array.isArray(meta.images.detail)) {
      meta.images.detail = fs
        .readdirSync(dir)
        .filter((f) => /^detail[-.].*\.(webp|png|jpe?g)$/i.test(f))
        .sort()
        .map(rel);
    } else {
      meta.images.detail = meta.images.detail.map(toWeb);
    }
    out.push(meta);
  }
  return out;
}

async function normalize(raw) {
  const slug = raw.slug;
  const where = `project "${slug || "(missing slug)"}"`;
  if (!slug) return fail("A project is missing a slug."), null;

  const kind = raw.kind;
  if (!KINDS.has(kind)) {
    fail(`${where}: kind must be "concept" or "verified" (got ${JSON.stringify(kind)}).`);
    return null;
  }
  for (const field of ["serviceType", "area", "title", "description"]) {
    if (!raw[field] || typeof raw[field] !== "string") {
      fail(`${where}: missing required string field "${field}".`);
      return null;
    }
  }
  const images = raw.images || {};
  if (!images.after) {
    fail(`${where}: images.after is required.`);
    return null;
  }
  if (!fileExists(images.after)) {
    fail(`${where}: images.after not found on disk: ${images.after}`);
    return null;
  }

  let alt = images.alt;
  if (!alt || typeof alt !== "string") {
    warn(`${where}: images.alt missing; falling back to title.`);
    alt = raw.title;
  }

  const hero = { src: images.after, alt };

  // Detail images (skip any that are missing).
  const detail = [];
  for (const d of Array.isArray(images.detail) ? images.detail : []) {
    const src = typeof d === "string" ? d : d?.src;
    if (!src) continue;
    if (!fileExists(src)) {
      warn(`${where}: detail image not found, skipping: ${src}`);
      continue;
    }
    detail.push({ src, alt: (typeof d === "object" && d?.alt) || `${raw.title} detail` });
  }

  // Before/after eligibility.
  let showBeforeAfter = false;
  let before;
  if (kind === "verified") {
    const hasBefore = !!images.before && fileExists(images.before);
    const sameSpace = images.sameSpaceBeforeAfter === true;
    if (images.before && !hasBefore) {
      warn(`${where}: images.before not found, slider disabled: ${images.before}`);
    }
    if (hasBefore && !sameSpace) {
      warn(`${where}: images.before present but sameSpaceBeforeAfter is not true, slider disabled.`);
    }
    if (hasBefore && sameSpace) {
      const [arAfter, arBefore] = await Promise.all([
        aspectRatio(images.after),
        aspectRatio(images.before),
      ]);
      const aspectOk =
        arAfter && arBefore && Math.abs(arAfter - arBefore) / arAfter <= ASPECT_TOLERANCE;
      if (!aspectOk) {
        warn(
          `${where}: before/after aspect ratios differ by more than ${Math.round(
            ASPECT_TOLERANCE * 100,
          )}%, slider disabled (show the completed image alone).`,
        );
      } else {
        showBeforeAfter = true;
        before = { src: images.before, alt: images.beforeAlt || `Before: ${raw.title}` };
      }
    }
  } else if (images.before) {
    warn(`${where}: kind "concept" ignores images.before (no fabricated before/after).`);
  }

  const project = {
    slug,
    kind,
    serviceType: raw.serviceType,
    area: raw.area,
    title: raw.title,
    description: raw.description,
    hero,
    detail,
    showBeforeAfter,
  };
  if (before) project.before = before;
  if (raw.scenario) project.scenario = raw.scenario;
  return project;
}

async function main() {
  const base = readBaseProjects();
  const folders = readFolderProjects();

  // Merge: folder entries override base by slug, then append new ones.
  const bySlug = new Map();
  for (const p of base) if (p.slug) bySlug.set(p.slug, p);
  for (const p of folders) if (p.slug) bySlug.set(p.slug, p);

  const normalized = [];
  const seen = new Set();
  for (const raw of bySlug.values()) {
    if (seen.has(raw.slug)) {
      fail(`Duplicate project slug: ${raw.slug}`);
      continue;
    }
    seen.add(raw.slug);
    const n = await normalize(raw);
    if (n) normalized.push(n);
  }

  for (const w of warns) console.warn(`  warn: ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`  ERROR: ${e}`);
    console.error(`\nprojects:build failed with ${errors.length} error(s).`);
    process.exit(1);
  }

  const generatedOn = new Date().toISOString().slice(0, 10);
  const body = `// AUTO-GENERATED by scripts/projects/build-projects.mjs. Do not edit by hand.
// Source: data/projects.json (+ any public/images/projects/<slug>/project.json).
// Run \`npm run projects:build\` to regenerate.
import type { SiteProject } from "@/shared/projects/types";

export const PROJECTS_GENERATED_ON = ${JSON.stringify(generatedOn)};

export const PROJECTS: SiteProject[] = ${JSON.stringify(normalized, null, 2)};
`;

  fs.writeFileSync(OUT_PATH, body);
  const concepts = normalized.filter((p) => p.kind === "concept").length;
  const verified = normalized.filter((p) => p.kind === "verified").length;
  const sliders = normalized.filter((p) => p.showBeforeAfter).length;
  console.log(
    `Wrote ${path.relative(ROOT, OUT_PATH)} (${normalized.length} projects: ${concepts} concept, ${verified} verified, ${sliders} before/after slider${sliders === 1 ? "" : "s"}).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
