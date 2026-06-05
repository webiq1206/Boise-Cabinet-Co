/**
 * Assembles the downloadable "full catalog" PDF entirely from the catalog SSOT,
 * so the document always reflects the live product data. Hybrid layout: image
 * thumbnails for small visual sets (collections, door styles, rooms, hardware,
 * accessories, one swatch per finish family) plus full text tables for the long
 * lists (all finishes, all cabinets).
 *
 * Image bytes are supplied by an injected resolver so this module stays free of
 * Node/`fs`/`sharp` concerns; the build script provides the resolver.
 *
 * Never renders internal-only tokens (oscCode / oscName) - customer-facing only.
 */
import type { PdfBlock, PdfImageCell } from "@/lib/pdf/drawResourcePdf";
import { SITE_CONFIG } from "@/shared/siteConfig";
import {
  COLLECTIONS,
  DOOR_STYLES,
  FINISHES,
  FINISHES_BY_CATEGORY,
  CABINET_PRODUCTS,
  CABINET_PRODUCTS_BY_CATEGORY,
  HARDWARE_OPTIONS,
  ACCESSORY_FAMILIES,
  ROOM_CATEGORIES,
  COLOR_FAMILIES,
  deriveColorFamily,
  getDoorStyleImages,
  getFinishImages,
  getProductImages,
  getHardwareImagePath,
  getAccessoryFamilyImagePath,
  type Finish,
  type FinishCategory,
  type CabinetProductCategory,
} from "@/shared/catalog";
import type { CabinetDimension } from "@/shared/catalog/types";

export const CATALOG_PDF_FOOTER = `${SITE_CONFIG.name} | ${SITE_CONFIG.siteUrl} | Full product catalog - planning reference, not a contract or quote`;

/**
 * Resolves a public image path (e.g. `/images/catalog/rooms/kitchen.webp`) to
 * embeddable JPEG bytes, or `null` when the file is missing/undecodable.
 */
export type CatalogImageResolver = (publicPath: string) => Promise<Uint8Array | null>;

const FINISH_CATEGORY_LABEL: Record<FinishCategory, string> = {
  matte: "Matte",
  gloss: "Gloss",
  woodgrain: "Woodgrain",
};

const CABINET_CATEGORY_LABEL: Record<CabinetProductCategory, string> = {
  base: "Base cabinets",
  wall: "Wall cabinets",
  tall: "Tall cabinets",
  vanity: "Vanity cabinets",
  "end-panel": "End panels",
  filler: "Fillers",
  hood: "Hoods",
  "floating-shelf": "Floating shelves",
  panel: "Panels",
};

const CABINET_CATEGORY_ORDER: CabinetProductCategory[] = [
  "base",
  "wall",
  "tall",
  "vanity",
  "hood",
  "floating-shelf",
  "filler",
  "end-panel",
  "panel",
];

function titleCase(value: string): string {
  return value
    .split(/[-\s]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function formatDimension(d: CabinetDimension | undefined): string {
  if (!d) return "-";
  if (d.variable) return "Variable";
  if (d.min != null && d.max != null) {
    return d.min === d.max ? `${d.min}"` : `${d.min}-${d.max}"`;
  }
  if (d.max != null) return `${d.max}"`;
  if (d.min != null) return `${d.min}"`;
  return "-";
}

/** First finish in a color family that has a usable swatch image. */
function representativeFinish(family: string): Finish | undefined {
  const inFamily = FINISHES.filter((f) => deriveColorFamily(f) === family);
  return inFamily.find((f) => Boolean(f.imagePath)) ?? inFamily[0];
}

export async function buildCatalogPdfBlocks(
  resolveImage: CatalogImageResolver,
): Promise<PdfBlock[]> {
  const blocks: PdfBlock[] = [];

  const imageCell = async (
    publicPath: string | undefined,
    caption: string,
    sub: string | undefined,
    fallbackHex?: string,
  ): Promise<PdfImageCell> => {
    const jpeg = publicPath ? await resolveImage(publicPath) : null;
    return { jpeg: jpeg ?? undefined, fallbackHex, caption, sub };
  };

  const generatedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Cover ──────────────────────────────────────────────────────────────────
  blocks.push({
    type: "cover",
    title: `${SITE_CONFIG.name} Full Catalog`,
    subtitle: SITE_CONFIG.tagline,
    metaLines: [
      `Generated ${generatedOn}`,
      `${DOOR_STYLES.length} door styles  -  ${FINISHES.length} finishes  -  ${CABINET_PRODUCTS.length} cabinet configurations`,
      `${COLLECTIONS.length} collections  -  ${HARDWARE_OPTIONS.length} hardware options  -  ${ACCESSORY_FAMILIES.length} accessory families`,
      `${SITE_CONFIG.phone}  -  ${SITE_CONFIG.siteUrl}`,
    ],
  });

  // ── Table of contents ────────────────────────────────────────────────────
  blocks.push({ type: "title", text: "What's inside" });
  blocks.push({
    type: "bullets",
    items: [
      `Collections (${COLLECTIONS.length})`,
      `Door styles (${DOOR_STYLES.length})`,
      `Rooms we build for (${ROOM_CATEGORIES.length})`,
      `Finishes (${FINISHES.length}) - by color family and full listing`,
      `Cabinets (${CABINET_PRODUCTS.length}) - by category with dimensions`,
      `Hardware (${HARDWARE_OPTIONS.length})`,
      `Accessories (${ACCESSORY_FAMILIES.length})`,
    ],
  });
  blocks.push({
    type: "paragraph",
    text: "All counts and listings are generated directly from our live product catalog, so this document stays in sync with what we currently offer.",
  });

  // ── Collections ────────────────────────────────────────────────────────────
  if (COLLECTIONS.length > 0) {
    blocks.push({ type: "heading", text: "Collections" });
    const cells = await Promise.all(
      COLLECTIONS.map((c) => imageCell(c.heroImage, c.name, c.tagline)),
    );
    blocks.push({ type: "image-grid", columns: 3, cells });
  }

  // ── Door styles ────────────────────────────────────────────────────────────
  blocks.push({ type: "heading", text: "Door styles" });
  const doorCells = await Promise.all(
    DOOR_STYLES.map((d) =>
      imageCell(
        getDoorStyleImages(d.slug, d.imagePath).primary,
        d.name,
        d.compatibleFinishCategories.map((c) => FINISH_CATEGORY_LABEL[c]).join(", "),
      ),
    ),
  );
  blocks.push({ type: "image-grid", columns: 3, cells: doorCells });

  // ── Rooms ──────────────────────────────────────────────────────────────────
  blocks.push({ type: "heading", text: "Rooms we build for" });
  const roomCells = await Promise.all(
    ROOM_CATEGORIES.map((r) => imageCell(r.heroImage, r.name, undefined)),
  );
  blocks.push({ type: "image-grid", columns: 4, cells: roomCells });

  // ── Finishes: representative swatch per color family ─────────────────────────
  blocks.push({ type: "heading", text: "Finishes by color family" });
  blocks.push({
    type: "paragraph",
    text: `We offer ${FINISHES.length} finishes across matte, gloss, and woodgrain. One representative swatch per color family is shown below; the complete list follows.`,
  });
  const familyCells: PdfImageCell[] = [];
  for (const family of COLOR_FAMILIES) {
    const rep = representativeFinish(family);
    if (!rep) continue;
    const count = FINISHES.filter((f) => deriveColorFamily(f) === family).length;
    familyCells.push(
      await imageCell(
        getFinishImages(rep.slug, rep.imagePath).swatch,
        family,
        `${count} finishes`,
        rep.hexColor,
      ),
    );
  }
  blocks.push({ type: "image-grid", columns: 4, cells: familyCells });

  // ── Finishes: every swatch, grouped by category ─────────────────────────────
  blocks.push({ type: "heading", text: "All finishes" });
  for (const category of ["matte", "gloss", "woodgrain"] as FinishCategory[]) {
    const list = FINISHES_BY_CATEGORY[category] ?? [];
    if (list.length === 0) continue;
    blocks.push({
      type: "subtitle",
      text: `${FINISH_CATEGORY_LABEL[category]} (${list.length})`,
    });
    const cells = await Promise.all(
      list.map((f) =>
        imageCell(
          getFinishImages(f.slug, f.imagePath).swatch,
          f.name,
          `${titleCase(f.sheen)} - ${deriveColorFamily(f)}`,
          f.hexColor,
        ),
      ),
    );
    blocks.push({ type: "image-grid", columns: 5, cells });
  }

  // ── Cabinets: every configuration thumbnail, grouped by category ────────────
  blocks.push({ type: "heading", text: "Cabinets by category" });
  blocks.push({
    type: "paragraph",
    text: `Every cabinet is built to order. The width range is shown beneath each configuration (${CABINET_PRODUCTS.length} total).`,
  });
  for (const category of CABINET_CATEGORY_ORDER) {
    const list = CABINET_PRODUCTS_BY_CATEGORY[category] ?? [];
    if (list.length === 0) continue;
    blocks.push({
      type: "subtitle",
      text: `${CABINET_CATEGORY_LABEL[category]} (${list.length})`,
    });
    const cells = await Promise.all(
      list.map((p) =>
        imageCell(
          getProductImages(p).thumb,
          p.name,
          `${formatDimension(p.dimensions?.width)} W`,
        ),
      ),
    );
    blocks.push({ type: "image-grid", columns: 4, cells });
  }

  // ── Hardware ────────────────────────────────────────────────────────────────
  blocks.push({ type: "heading", text: "Hardware" });
  const hardwareCells = await Promise.all(
    HARDWARE_OPTIONS.map((h) =>
      imageCell(getHardwareImagePath(h.slug), h.name, titleCase(h.finish)),
    ),
  );
  blocks.push({ type: "image-grid", columns: 4, cells: hardwareCells });

  // ── Accessories ─────────────────────────────────────────────────────────────
  blocks.push({ type: "heading", text: "Accessories" });
  const accessoryCells = await Promise.all(
    ACCESSORY_FAMILIES.map((a) =>
      imageCell(getAccessoryFamilyImagePath(a.slug), a.name, titleCase(a.category)),
    ),
  );
  blocks.push({ type: "image-grid", columns: 4, cells: accessoryCells });

  return blocks;
}
