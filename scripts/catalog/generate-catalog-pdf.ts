/**
 * Generate the downloadable full-catalog PDF from the catalog SSOT.
 * Run: npx tsx scripts/catalog/generate-catalog-pdf.ts
 *
 * Resolves catalog image paths from /public, converts them to JPEG with sharp
 * (pdf-lib only embeds JPEG/PNG), assembles the hybrid blocks, and writes
 * public/downloads/boise-cabinet-catalog.pdf so the download stays in sync with
 * the catalog on every build.
 */
import { mkdir, writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";
import { buildResourcePdf, type ResourcePdfFonts } from "../../lib/pdf/drawResourcePdf";
import {
  buildCatalogPdfBlocks,
  CATALOG_PDF_FOOTER,
  type CatalogImageResolver,
} from "../../shared/catalog/catalogPdfContent";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const OUT_DIR = path.join(PUBLIC_DIR, "downloads");
const OUT_FILE = path.join(OUT_DIR, "boise-cabinet-catalog.pdf");
const FONT_DIR = path.join(process.cwd(), "lib", "pdf", "fonts");

/** Load the embedded Montserrat + Libre Baskerville italic brand fonts for the
 *  dark theme. A missing file just falls back to standard fonts, so the build
 *  never breaks. */
async function loadBrandFonts(): Promise<ResourcePdfFonts> {
  const load = async (file: string): Promise<Uint8Array | undefined> => {
    const abs = path.join(FONT_DIR, file);
    if (!existsSync(abs)) return undefined;
    return new Uint8Array(await readFile(abs));
  };
  return {
    sansLight: await load("Montserrat-Light.ttf"),
    sansRegular: await load("Montserrat-Regular.ttf"),
    serifItalic: await load("LibreBaskerville-Italic.ttf"),
  };
}

const cache = new Map<string, Promise<Uint8Array | null>>();
let resolved = 0;
let missing = 0;

const resolveImage: CatalogImageResolver = (publicPath) => {
  if (cache.has(publicPath)) return cache.get(publicPath)!;
  const promise = (async () => {
    try {
      const rel = publicPath.replace(/^\//, "");
      const abs = path.join(PUBLIC_DIR, rel);
      if (!existsSync(abs)) {
        missing += 1;
        return null;
      }
      // density helps rasterize any SVG sources cleanly; the larger cap keeps the
      // big cabinet family drawings (and their baked-in legends) legible.
      const buf = await sharp(abs, { density: 300 })
        .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 82 })
        .toBuffer();
      resolved += 1;
      return new Uint8Array(buf);
    } catch {
      missing += 1;
      return null;
    }
  })();
  cache.set(publicPath, promise);
  return promise;
};

async function main() {
  const blocks = await buildCatalogPdfBlocks(resolveImage);
  const fonts = await loadBrandFonts();
  const bytes = await buildResourcePdf(blocks, CATALOG_PDF_FOOTER, { theme: "dark", fonts });

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, bytes);

  console.log(
    `Wrote ${path.relative(process.cwd(), OUT_FILE)} (${(bytes.length / 1024).toFixed(0)} KB)`,
  );
  console.log(`Images embedded: ${resolved}, missing/skipped: ${missing}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
