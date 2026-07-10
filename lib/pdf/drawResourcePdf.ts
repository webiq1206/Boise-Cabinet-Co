import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
  type PDFImage,
  type RGB,
} from 'pdf-lib';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const BODY_SIZE = 10;
const LINE_HEIGHT = 14;
const HEADING_SIZE = 14;
const TITLE_SIZE = 18;
const SUBTITLE_SIZE = 11;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = 28;
const BOTTOM_LIMIT = MARGIN + 24;

/** A single cell in an image-grid block. */
export interface PdfImageCell {
  /** Pre-encoded JPEG bytes (pdf-lib only embeds JPEG/PNG). */
  jpeg?: Uint8Array;
  /** Flat color (hex) drawn when no image is available, e.g. finish swatches. */
  fallbackHex?: string;
  caption: string;
  sub?: string;
}

export type PdfBlock =
  | { type: 'title'; text: string }
  | { type: 'subtitle'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'checkboxes'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'spacer'; lines?: number }
  | { type: 'page-break' }
  | {
      type: 'cover';
      title: string;
      subtitle?: string;
      metaLines?: string[];
      /** Optional brand logo (JPEG/PNG bytes) drawn at the top of the cover. */
      logo?: Uint8Array;
    }
  | {
      type: 'image-grid';
      columns?: number;
      cells: PdfImageCell[];
      /** Image box height as a fraction of cell width. Defaults to 0.72. */
      aspect?: number;
    };

/** Embeddable brand font bytes (TTF/OTF). Injected by the Node build script so
 *  this shared module stays free of `fs`. */
export interface ResourcePdfFonts {
  sansLight?: Uint8Array;
  sansRegular?: Uint8Array;
  serifItalic?: Uint8Array;
}

export interface ResourcePdfOptions {
  /** 'light' (default) keeps the original printable look; 'dark' applies the
   *  Boise Cabinet Co dark brand system (charcoal ground, bone + Fraunces italic). */
  theme?: 'light' | 'dark';
  fonts?: ResourcePdfFonts;
}

// ── Theme ───────────────────────────────────────────────────────────────────
interface Theme {
  dark: boolean;
  pageBg: RGB | null;
  title: RGB;
  heading: RGB;
  body: RGB;
  subtitle: RGB;
  meta: RGB;
  coverSubtitle: RGB;
  imageSub: RGB;
  footer: RGB;
  hairline: RGB;
  numeral: RGB;
  accent: RGB;
  /** Ink for lists / checkboxes / table rows (pure black in the light theme). */
  ink: RGB;
  cardBg: RGB;
  cardBorder: RGB;
  placeholderBg: RGB;
  tableHeaderBg: RGB;
  tableHeaderText: RGB;
}

const hex = (h: string): RGB => {
  const c = h.replace('#', '');
  return rgb(
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  );
};

/** Original printable palette — light output stays byte-for-byte identical. */
const LIGHT_THEME: Theme = {
  dark: false,
  pageBg: null,
  title: rgb(0.1, 0.1, 0.1),
  heading: rgb(0.15, 0.15, 0.15),
  body: rgb(0.15, 0.15, 0.15),
  subtitle: rgb(0.3, 0.3, 0.3),
  meta: rgb(0.3, 0.3, 0.3),
  coverSubtitle: rgb(0.35, 0.35, 0.35),
  imageSub: rgb(0.4, 0.4, 0.4),
  footer: rgb(0.45, 0.45, 0.45),
  hairline: rgb(0.8, 0.8, 0.78),
  numeral: rgb(0.4, 0.4, 0.4),
  accent: rgb(0.3, 0.3, 0.3),
  ink: rgb(0, 0, 0),
  cardBg: rgb(1, 1, 1),
  cardBorder: rgb(0.82, 0.82, 0.8),
  placeholderBg: rgb(0.96, 0.96, 0.95),
  tableHeaderBg: rgb(0.92, 0.92, 0.9),
  tableHeaderText: rgb(0, 0, 0),
};

/** Boise Cabinet Co dark brand system (matches the brand-system document). */
const DARK_THEME: Theme = {
  dark: true,
  pageBg: hex('1C1F1E'), // charcoal page base
  title: hex('F7F5F3'), // bone
  heading: hex('F7F5F3'),
  body: hex('E6E3DE'), // warm text
  subtitle: hex('9AA098'), // mist
  meta: hex('9AA098'),
  coverSubtitle: hex('9AA098'),
  imageSub: hex('9AA098'),
  footer: hex('9AA098'),
  hairline: hex('4A4F4C'), // subtle light hairline on charcoal
  numeral: hex('9AA098'), // Fraunces-italic section numbers, mist
  accent: hex('93A386'), // sage
  ink: hex('E6E3DE'),
  // Product line-drawings are black-on-white, so cards stay a light bone tile.
  cardBg: hex('F5F3EF'),
  cardBorder: hex('4A4F4C'),
  placeholderBg: hex('2C302F'), // charcoal tile
  tableHeaderBg: hex('2C302F'),
  tableHeaderText: hex('F7F5F3'),
};

/** Resolved fonts by semantic role (already embedded). */
interface RoleFonts {
  title: PDFFont;
  heading: PDFFont;
  body: PDFFont;
  label: PDFFont;
  caption: PDFFont;
  accent: PDFFont; // Fraunces italic (dark) / Times italic (light, unused)
}

interface PdfContext {
  doc: PDFDocument;
  page: PDFPage;
  theme: Theme;
  f: RoleFonts;
  y: number;
  sectionNo: number;
  /** Embedded images keyed by their source JPEG bytes (pre-embedded once). */
  imageCache: Map<Uint8Array, PDFImage>;
}

function paintBackground(ctx: PdfContext): void {
  if (!ctx.theme.pageBg) return;
  ctx.page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: ctx.theme.pageBg,
  });
}

function newPage(ctx: PdfContext): void {
  ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  paintBackground(ctx);
  ctx.y = PAGE_HEIGHT - MARGIN;
}

/** True when the current page already has content below its top margin. */
function pageHasContent(ctx: PdfContext): boolean {
  return ctx.y < PAGE_HEIGHT - MARGIN - 1;
}

function ensureSpace(ctx: PdfContext, needed: number): void {
  if (ctx.y - needed < BOTTOM_LIMIT) {
    newPage(ctx);
  }
}

/** Draw a string with manual letter-spacing (for wide-tracked brand labels). */
function drawTracked(
  ctx: PdfContext,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color: RGB,
  tracking: number,
): number {
  let cx = x;
  for (const ch of text) {
    ctx.page.drawText(ch, { x: cx, y, size, font, color });
    cx += font.widthOfTextAtSize(ch, size) + tracking;
  }
  return cx - tracking;
}

/** Wrap text to fit within an explicit max width. */
function wrapWithin(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

/** Truncate a single line to maxWidth, appending an ellipsis when clipped. */
function ellipsize(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(`${t}…`, size) > maxWidth) {
    t = t.slice(0, -1);
  }
  return `${t.trimEnd()}…`;
}

/** Wrap to a width and cap at maxLines, ellipsizing the final line on overflow. */
function wrapFit(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
  maxLines: number,
): string[] {
  const all = wrapWithin(text, font, size, maxWidth);
  if (all.length <= maxLines) {
    return all.map((l) => ellipsize(l, font, size, maxWidth));
  }
  const kept = all.slice(0, maxLines);
  const overflow = all.slice(maxLines - 1).join(' ');
  kept[maxLines - 1] = ellipsize(overflow, font, size, maxWidth);
  return kept.map((l) => ellipsize(l, font, size, maxWidth));
}

function wrapLine(text: string, font: PDFFont, size: number): string[] {
  return wrapWithin(text, font, size, MAX_WIDTH);
}

function drawLines(
  ctx: PdfContext,
  lines: string[],
  size: number,
  font: PDFFont,
  color: RGB,
): void {
  for (const line of lines) {
    ensureSpace(ctx, LINE_HEIGHT);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font, color });
    ctx.y -= LINE_HEIGHT;
  }
}

/** Geometry for an image-grid, so the keep-with-next logic can reserve a row. */
function gridMetrics(block: Extract<PdfBlock, { type: 'image-grid' }>) {
  const columns = block.columns ?? 4;
  const gutter = 12;
  const cellW = (MAX_WIDTH - gutter * (columns - 1)) / columns;
  const imgH = cellW * (block.aspect ?? 0.72);
  const captionSize = cellW > 200 ? 10 : 8;
  const subSize = cellW > 200 ? 8 : 7;
  const captionLineH = captionSize + 2;
  const subLineH = subSize + 2;
  // Worst-case caption block: 2 caption lines + 1 sub line.
  const captionBlockH = 8 + 2 * captionLineH + subLineH;
  const rowH = imgH + captionBlockH + gutter;
  return { columns, gutter, cellW, imgH, captionSize, subSize, captionLineH, subLineH, rowH };
}

/** Estimated height of the first "unit" of a block, for keep-with-next. */
function firstRowHeight(block: PdfBlock): number {
  if (block.type === 'image-grid') return gridMetrics(block).rowH;
  if (block.type === 'table') return 16 * 2;
  if (block.type === 'paragraph') return LINE_HEIGHT * 2;
  if (block.type === 'bullets' || block.type === 'checkboxes') return LINE_HEIGHT;
  return LINE_HEIGHT;
}

function drawImageCard(
  ctx: PdfContext,
  cell: PdfImageCell,
  x: number,
  top: number,
  cellW: number,
  imgH: number,
): void {
  const inset = 8;
  const { cardBg, cardBorder, placeholderBg } = ctx.theme;
  const embedded = cell.jpeg ? ctx.imageCache.get(cell.jpeg) : undefined;

  if (embedded) {
    // Light card with a hairline border behind the artwork.
    ctx.page.drawRectangle({
      x,
      y: top - imgH,
      width: cellW,
      height: imgH,
      color: cardBg,
      borderColor: cardBorder,
      borderWidth: 0.75,
    });
    const boxW = cellW - inset * 2;
    const boxH = imgH - inset * 2;
    const scale = Math.min(boxW / embedded.width, boxH / embedded.height);
    const w = embedded.width * scale;
    const h = embedded.height * scale;
    ctx.page.drawImage(embedded, {
      x: x + (cellW - w) / 2,
      y: top - imgH + (imgH - h) / 2,
      width: w,
      height: h,
    });
  } else if (cell.fallbackHex) {
    // Flat color tile (e.g. a finish swatch) with a subtle border.
    ctx.page.drawRectangle({
      x,
      y: top - imgH,
      width: cellW,
      height: imgH,
      color: hex(cell.fallbackHex.replace('#', '').length === 6 ? cell.fallbackHex : '#E6E6E4'),
      borderColor: cardBorder,
      borderWidth: 0.75,
    });
  } else {
    // Neutral labeled placeholder card.
    ctx.page.drawRectangle({
      x,
      y: top - imgH,
      width: cellW,
      height: imgH,
      color: placeholderBg,
      borderColor: cardBorder,
      borderWidth: 0.75,
    });
  }
}

/** Numbered section heading in the brand style: Fraunces-italic numeral + light
 *  bone title over a hairline rule. */
function drawBrandHeading(ctx: PdfContext, text: string): void {
  ctx.y -= 14;
  ensureSpace(ctx, 34);
  const num = String(ctx.sectionNo).padStart(2, '0');
  const numSize = 15;
  const titleSize = HEADING_SIZE;
  const numW = ctx.f.accent.widthOfTextAtSize(num, numSize);
  const baseline = ctx.y;
  ctx.page.drawText(num, {
    x: MARGIN,
    y: baseline,
    size: numSize,
    font: ctx.f.accent,
    color: ctx.theme.numeral,
  });
  drawTracked(
    ctx,
    text,
    MARGIN + numW + 14,
    baseline,
    titleSize,
    ctx.f.heading,
    ctx.theme.heading,
    0.4,
  );
  ctx.y -= 10;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: PAGE_WIDTH - MARGIN, y: ctx.y },
    thickness: 0.75,
    color: ctx.theme.hairline,
  });
  ctx.y -= 14;
  ctx.sectionNo += 1;
}

function drawBlock(ctx: PdfContext, block: PdfBlock): void {
  const t = ctx.theme;
  switch (block.type) {
    case 'title': {
      ensureSpace(ctx, 40);
      const lines = wrapLine(block.text, ctx.f.title, TITLE_SIZE);
      for (const line of lines) {
        ctx.page.drawText(line, {
          x: MARGIN,
          y: ctx.y,
          size: TITLE_SIZE,
          font: ctx.f.title,
          color: t.title,
        });
        ctx.y -= 22;
      }
      ctx.y -= 8;
      break;
    }
    case 'subtitle': {
      ensureSpace(ctx, 24);
      drawLines(ctx, wrapLine(block.text, ctx.f.label, SUBTITLE_SIZE), SUBTITLE_SIZE, ctx.f.label, t.subtitle);
      ctx.y -= 6;
      break;
    }
    case 'heading': {
      ensureSpace(ctx, 30);
      if (t.dark) {
        drawBrandHeading(ctx, block.text);
        break;
      }
      ctx.y -= 8;
      drawLines(ctx, wrapLine(block.text, ctx.f.heading, HEADING_SIZE), HEADING_SIZE, ctx.f.heading, t.heading);
      // Underline rule beneath the section heading.
      ctx.y += 2;
      ctx.page.drawLine({
        start: { x: MARGIN, y: ctx.y },
        end: { x: PAGE_WIDTH - MARGIN, y: ctx.y },
        thickness: 0.75,
        color: t.hairline,
      });
      ctx.y -= 10;
      break;
    }
    case 'paragraph': {
      drawLines(ctx, wrapLine(block.text, ctx.f.body, BODY_SIZE), BODY_SIZE, ctx.f.body, t.body);
      ctx.y -= 4;
      break;
    }
    case 'bullets': {
      for (const item of block.items) {
        const wrapped = wrapLine(item, ctx.f.body, BODY_SIZE);
        wrapped.forEach((line, i) => {
          ensureSpace(ctx, LINE_HEIGHT);
          if (t.dark) {
            // Sage em-dash marker, text in the warm ink.
            if (i === 0) {
              ctx.page.drawText('—', { x: MARGIN, y: ctx.y, size: BODY_SIZE, font: ctx.f.body, color: t.accent });
            }
            ctx.page.drawText(line, { x: MARGIN + 16, y: ctx.y, size: BODY_SIZE, font: ctx.f.body, color: t.ink });
          } else {
            const prefix = i === 0 ? '•  ' : '   ';
            ctx.page.drawText(`${prefix}${line}`, {
              x: MARGIN,
              y: ctx.y,
              size: BODY_SIZE,
              font: ctx.f.body,
              color: t.ink,
            });
          }
          ctx.y -= LINE_HEIGHT;
        });
      }
      ctx.y -= 2;
      break;
    }
    case 'checkboxes': {
      for (const item of block.items) {
        const wrapped = wrapLine(item, ctx.f.body, BODY_SIZE);
        wrapped.forEach((line, i) => {
          ensureSpace(ctx, LINE_HEIGHT + 2);
          const box = i === 0 ? '[ ] ' : '    ';
          ctx.page.drawText(`${box}${line}`, {
            x: MARGIN,
            y: ctx.y,
            size: BODY_SIZE,
            font: ctx.f.body,
            color: t.ink,
          });
          ctx.y -= LINE_HEIGHT + 2;
        });
      }
      ctx.y -= 2;
      break;
    }
    case 'table': {
      const colCount = block.headers.length;
      const colWidth = MAX_WIDTH / colCount;
      const rowH = 16;
      ensureSpace(ctx, rowH * 2);
      block.headers.forEach((h, i) => {
        ctx.page.drawRectangle({
          x: MARGIN + i * colWidth,
          y: ctx.y - rowH + 4,
          width: colWidth,
          height: rowH,
          color: t.tableHeaderBg,
        });
        ctx.page.drawText(h, {
          x: MARGIN + i * colWidth + 4,
          y: ctx.y - 10,
          size: 8,
          font: ctx.f.label,
          color: t.tableHeaderText,
        });
      });
      ctx.y -= rowH;
      for (const row of block.rows) {
        ensureSpace(ctx, rowH);
        row.forEach((cell, i) => {
          const clipped = cell.length > 28 ? `${cell.slice(0, 26)}…` : cell;
          ctx.page.drawText(clipped, {
            x: MARGIN + i * colWidth + 4,
            y: ctx.y - 10,
            size: 8,
            font: ctx.f.body,
            color: t.ink,
          });
        });
        if (t.dark) {
          ctx.page.drawLine({
            start: { x: MARGIN, y: ctx.y - rowH + 4 },
            end: { x: PAGE_WIDTH - MARGIN, y: ctx.y - rowH + 4 },
            thickness: 0.5,
            color: t.hairline,
          });
        }
        ctx.y -= rowH;
      }
      ctx.y -= 8;
      break;
    }
    case 'spacer': {
      ctx.y -= (block.lines ?? 1) * LINE_HEIGHT;
      break;
    }
    case 'page-break': {
      if (pageHasContent(ctx)) newPage(ctx);
      break;
    }
    case 'cover': {
      if (t.dark) {
        drawBrandCover(ctx, block);
        break;
      }
      // Logo + vertically centered brand cover on its own page (light theme).
      let cursor = PAGE_HEIGHT * 0.7;
      if (block.logo) {
        const logo = ctx.imageCache.get(block.logo);
        if (logo) {
          const targetW = Math.min(260, MAX_WIDTH);
          const scale = targetW / logo.width;
          const w = logo.width * scale;
          const h = logo.height * scale;
          ctx.page.drawImage(logo, { x: MARGIN, y: cursor - h, width: w, height: h });
          cursor -= h + 30;
        }
      }
      ctx.y = cursor;
      const COVER_TITLE = 30;
      const titleLines = wrapLine(block.title, ctx.f.title, COVER_TITLE);
      for (const line of titleLines) {
        ctx.page.drawText(line, {
          x: MARGIN,
          y: ctx.y,
          size: COVER_TITLE,
          font: ctx.f.title,
          color: t.title,
        });
        ctx.y -= COVER_TITLE + 6;
      }
      if (block.subtitle) {
        ctx.y -= 6;
        drawLines(ctx, wrapLine(block.subtitle, ctx.f.body, SUBTITLE_SIZE), SUBTITLE_SIZE, ctx.f.body, t.coverSubtitle);
      }
      if (block.metaLines?.length) {
        ctx.y -= 12;
        drawLines(ctx, block.metaLines, BODY_SIZE, ctx.f.body, t.meta);
      }
      newPage(ctx);
      break;
    }
    case 'image-grid': {
      const { columns, gutter, cellW, imgH, captionSize, subSize, captionLineH, subLineH } =
        gridMetrics(block);

      for (let i = 0; i < block.cells.length; i += columns) {
        const row = block.cells.slice(i, i + columns);

        // Pre-wrap captions so the row height matches the tallest cell exactly.
        const wrapped = row.map((cell) => {
          const captionLines = wrapFit(cell.caption, ctx.f.caption, captionSize, cellW, 2);
          const subLines = cell.sub ? wrapFit(cell.sub, ctx.f.body, subSize, cellW, 1) : [];
          return { cell, captionLines, subLines };
        });
        const maxCaptionLines = Math.max(1, ...wrapped.map((w) => w.captionLines.length));
        const maxSubLines = Math.max(0, ...wrapped.map((w) => w.subLines.length));
        const captionBlockH = 10 + maxCaptionLines * captionLineH + maxSubLines * subLineH;
        const rowH = imgH + captionBlockH + gutter;

        ensureSpace(ctx, rowH);
        const rowTop = ctx.y;

        wrapped.forEach(({ cell, captionLines, subLines }, col) => {
          const x = MARGIN + col * (cellW + gutter);
          drawImageCard(ctx, cell, x, rowTop, cellW, imgH);

          let cy = rowTop - imgH - 10;
          for (const line of captionLines) {
            ctx.page.drawText(line, {
              x,
              y: cy,
              size: captionSize,
              font: ctx.f.caption,
              color: t.dark ? t.heading : t.ink,
            });
            cy -= captionLineH;
          }
          for (const line of subLines) {
            ctx.page.drawText(line, {
              x,
              y: cy,
              size: subSize,
              font: ctx.f.body,
              color: t.imageSub,
            });
            cy -= subLineH;
          }
        });

        ctx.y = rowTop - rowH;
      }
      ctx.y -= 4;
      break;
    }
  }
}

/** Brand cover page: a typographic wordmark lockup + title on the charcoal ground. */
function drawBrandCover(ctx: PdfContext, block: Extract<PdfBlock, { type: 'cover' }>): void {
  const t = ctx.theme;
  const left = MARGIN;

  // Eyebrow.
  drawTracked(ctx, 'BOISE CABINET CO', left, PAGE_HEIGHT * 0.78, 9, ctx.f.label, t.subtitle, 3);

  // Wordmark: "BOISE CABINET " (light, tracked) + "Co." (Fraunces italic).
  const wmY = PAGE_HEIGHT * 0.7;
  const wmSize = 27;
  const endX = drawTracked(ctx, 'BOISE CABINET ', left, wmY, wmSize, ctx.f.heading, t.title, 2);
  ctx.page.drawText('Co.', {
    x: endX + 6,
    y: wmY,
    size: wmSize,
    font: ctx.f.accent,
    color: t.title,
  });
  // Hairline + lockup sub-labels.
  ctx.page.drawLine({
    start: { x: left, y: wmY - 14 },
    end: { x: left + 150, y: wmY - 14 },
    thickness: 0.75,
    color: t.hairline,
  });
  drawTracked(ctx, 'CUSTOM CABINETRY', left, wmY - 30, 8, ctx.f.label, t.subtitle, 2.5);
  drawTracked(ctx, 'TREASURE VALLEY · IDAHO', left, wmY - 44, 7, ctx.f.label, t.meta, 2);

  // Title.
  ctx.y = PAGE_HEIGHT * 0.4;
  const COVER_TITLE = 40;
  for (const line of wrapLine(block.title, ctx.f.title, COVER_TITLE)) {
    ctx.page.drawText(line, { x: left, y: ctx.y, size: COVER_TITLE, font: ctx.f.title, color: t.title });
    ctx.y -= COVER_TITLE + 6;
  }
  if (block.subtitle) {
    ctx.y -= 4;
    ctx.page.drawText(block.subtitle, { x: left, y: ctx.y, size: 13, font: ctx.f.accent, color: t.subtitle });
    ctx.y -= 22;
  }
  if (block.metaLines?.length) {
    ctx.y -= 10;
    for (const line of block.metaLines) {
      ensureSpace(ctx, LINE_HEIGHT);
      ctx.page.drawText(line, { x: left, y: ctx.y, size: BODY_SIZE, font: ctx.f.body, color: t.meta });
      ctx.y -= LINE_HEIGHT;
    }
  }
  newPage(ctx);
}

function drawFooter(ctx: PdfContext, footerText: string): void {
  const pages = ctx.doc.getPages();
  const size = 8;
  const t = ctx.theme;
  pages.forEach((page, index) => {
    if (t.dark) {
      page.drawLine({
        start: { x: MARGIN, y: FOOTER_Y + 12 },
        end: { x: PAGE_WIDTH - MARGIN, y: FOOTER_Y + 12 },
        thickness: 0.5,
        color: t.hairline,
      });
    }
    page.drawText(footerText, { x: MARGIN, y: FOOTER_Y, size, font: ctx.f.body, color: t.footer });
    page.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: PAGE_WIDTH - MARGIN - 60,
      y: FOOTER_Y,
      size,
      font: ctx.f.body,
      color: t.footer,
    });
  });
}

export async function buildResourcePdf(
  blocks: PdfBlock[],
  footerText: string,
  options: ResourcePdfOptions = {},
): Promise<Uint8Array> {
  const wantDark = options.theme === 'dark';
  const doc = await PDFDocument.create();

  // Standard fonts are always available as a fallback.
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  // Embed the brand TTFs for the dark theme (falls back to standard fonts if the
  // bytes are missing or undecodable, so a build never breaks over a font file).
  let sansLight = helv;
  let sansRegular = helv;
  let serifItalic = timesItalic;
  if (wantDark && options.fonts) {
    try {
      const fontkit = (await import('@pdf-lib/fontkit')).default;
      doc.registerFontkit(fontkit);
      const { sansLight: sl, sansRegular: sr, serifItalic: si } = options.fonts;
      if (sl) sansLight = await doc.embedFont(sl, { subset: true });
      if (sr) sansRegular = await doc.embedFont(sr, { subset: true });
      if (si) serifItalic = await doc.embedFont(si, { subset: true });
    } catch {
      // keep standard-font fallbacks
    }
  }

  const theme = wantDark ? DARK_THEME : LIGHT_THEME;
  const f: RoleFonts = wantDark
    ? {
        title: sansLight,
        heading: sansLight,
        body: sansRegular,
        label: sansRegular,
        caption: sansRegular,
        accent: serifItalic,
      }
    : {
        title: helvBold,
        heading: helvBold,
        body: helv,
        label: helvBold,
        caption: helvBold,
        accent: timesItalic,
      };

  // Embed every image once up front so the synchronous draw pass can reuse them.
  const imageCache = new Map<Uint8Array, PDFImage>();
  const embedOnce = async (bytes: Uint8Array) => {
    if (imageCache.has(bytes)) return;
    try {
      // pdf-lib embeds JPEG and PNG; resolver supplies JPEG, logo may be PNG.
      const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
      imageCache.set(bytes, isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes));
    } catch {
      // Skip undecodable images; the cell falls back to a flat tile.
    }
  };
  for (const block of blocks) {
    if (block.type === 'cover' && block.logo) await embedOnce(block.logo);
    if (block.type !== 'image-grid') continue;
    for (const cell of block.cells) {
      if (cell.jpeg) await embedOnce(cell.jpeg);
    }
  }

  const ctx: PdfContext = {
    doc,
    page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    theme,
    f,
    y: PAGE_HEIGHT - MARGIN,
    sectionNo: 1,
    imageCache,
  };
  paintBackground(ctx);

  // Keep section headings/subtitles with the first row of their following block.
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    if (block.type === 'heading' || block.type === 'subtitle') {
      const next = blocks[i + 1];
      const reserve = (block.type === 'heading' ? 40 : 32) + (next ? firstRowHeight(next) : 0);
      ensureSpace(ctx, reserve);
    }
    drawBlock(ctx, block);
  }

  drawFooter(ctx, footerText);
  return doc.save();
}
