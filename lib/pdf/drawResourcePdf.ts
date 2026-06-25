import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
  type PDFImage,
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

interface PdfContext {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  y: number;
  /** Embedded images keyed by their source JPEG bytes (pre-embedded once). */
  imageCache: Map<Uint8Array, PDFImage>;
}

function newPage(ctx: PdfContext): void {
  ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
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
  color = rgb(0.15, 0.15, 0.15),
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
  const embedded = cell.jpeg ? ctx.imageCache.get(cell.jpeg) : undefined;

  if (embedded) {
    // White card with a hairline border behind the artwork.
    ctx.page.drawRectangle({
      x,
      y: top - imgH,
      width: cellW,
      height: imgH,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.82, 0.82, 0.8),
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
    const c = hexToRgb(cell.fallbackHex);
    ctx.page.drawRectangle({
      x,
      y: top - imgH,
      width: cellW,
      height: imgH,
      color: rgb(c.r, c.g, c.b),
      borderColor: rgb(0.82, 0.82, 0.8),
      borderWidth: 0.75,
    });
  } else {
    // Neutral labeled placeholder card.
    ctx.page.drawRectangle({
      x,
      y: top - imgH,
      width: cellW,
      height: imgH,
      color: rgb(0.96, 0.96, 0.95),
      borderColor: rgb(0.82, 0.82, 0.8),
      borderWidth: 0.75,
    });
  }
}

function drawBlock(ctx: PdfContext, block: PdfBlock): void {
  switch (block.type) {
    case 'title': {
      ensureSpace(ctx, 40);
      const lines = wrapLine(block.text, ctx.bold, TITLE_SIZE);
      for (const line of lines) {
        ctx.page.drawText(line, {
          x: MARGIN,
          y: ctx.y,
          size: TITLE_SIZE,
          font: ctx.bold,
          color: rgb(0.1, 0.1, 0.1),
        });
        ctx.y -= 22;
      }
      ctx.y -= 8;
      break;
    }
    case 'subtitle': {
      ensureSpace(ctx, 24);
      drawLines(
        ctx,
        wrapLine(block.text, ctx.bold, SUBTITLE_SIZE),
        SUBTITLE_SIZE,
        ctx.bold,
        rgb(0.3, 0.3, 0.3),
      );
      ctx.y -= 6;
      break;
    }
    case 'heading': {
      ensureSpace(ctx, 30);
      ctx.y -= 8;
      drawLines(ctx, wrapLine(block.text, ctx.bold, HEADING_SIZE), HEADING_SIZE, ctx.bold);
      // Underline rule beneath the section heading.
      ctx.y += 2;
      ctx.page.drawLine({
        start: { x: MARGIN, y: ctx.y },
        end: { x: PAGE_WIDTH - MARGIN, y: ctx.y },
        thickness: 0.75,
        color: rgb(0.8, 0.8, 0.78),
      });
      ctx.y -= 10;
      break;
    }
    case 'paragraph': {
      drawLines(ctx, wrapLine(block.text, ctx.font, BODY_SIZE), BODY_SIZE, ctx.font);
      ctx.y -= 4;
      break;
    }
    case 'bullets': {
      for (const item of block.items) {
        const wrapped = wrapLine(item, ctx.font, BODY_SIZE);
        wrapped.forEach((line, i) => {
          ensureSpace(ctx, LINE_HEIGHT);
          const prefix = i === 0 ? '•  ' : '   ';
          ctx.page.drawText(`${prefix}${line}`, {
            x: MARGIN,
            y: ctx.y,
            size: BODY_SIZE,
            font: ctx.font,
          });
          ctx.y -= LINE_HEIGHT;
        });
      }
      ctx.y -= 2;
      break;
    }
    case 'checkboxes': {
      for (const item of block.items) {
        const wrapped = wrapLine(item, ctx.font, BODY_SIZE);
        wrapped.forEach((line, i) => {
          ensureSpace(ctx, LINE_HEIGHT + 2);
          const box = i === 0 ? '[ ] ' : '    ';
          ctx.page.drawText(`${box}${line}`, {
            x: MARGIN,
            y: ctx.y,
            size: BODY_SIZE,
            font: ctx.font,
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
          color: rgb(0.92, 0.92, 0.9),
        });
        ctx.page.drawText(h, {
          x: MARGIN + i * colWidth + 4,
          y: ctx.y - 10,
          size: 8,
          font: ctx.bold,
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
            font: ctx.font,
          });
        });
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
      // Logo + vertically centered brand cover on its own page.
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
      const titleLines = wrapLine(block.title, ctx.bold, COVER_TITLE);
      for (const line of titleLines) {
        ctx.page.drawText(line, {
          x: MARGIN,
          y: ctx.y,
          size: COVER_TITLE,
          font: ctx.bold,
          color: rgb(0.1, 0.1, 0.1),
        });
        ctx.y -= COVER_TITLE + 6;
      }
      if (block.subtitle) {
        ctx.y -= 6;
        drawLines(
          ctx,
          wrapLine(block.subtitle, ctx.font, SUBTITLE_SIZE),
          SUBTITLE_SIZE,
          ctx.font,
          rgb(0.35, 0.35, 0.35),
        );
      }
      if (block.metaLines?.length) {
        ctx.y -= 12;
        drawLines(ctx, block.metaLines, BODY_SIZE, ctx.font, rgb(0.3, 0.3, 0.3));
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
          const captionLines = wrapFit(cell.caption, ctx.bold, captionSize, cellW, 2);
          const subLines = cell.sub ? wrapFit(cell.sub, ctx.font, subSize, cellW, 1) : [];
          return { cell, captionLines, subLines };
        });
        const maxCaptionLines = Math.max(1, ...wrapped.map((w) => w.captionLines.length));
        const maxSubLines = Math.max(0, ...wrapped.map((w) => w.subLines.length));
        const captionBlockH =
          10 + maxCaptionLines * captionLineH + maxSubLines * subLineH;
        const rowH = imgH + captionBlockH + gutter;

        ensureSpace(ctx, rowH);
        const rowTop = ctx.y;

        wrapped.forEach(({ cell, captionLines, subLines }, col) => {
          const x = MARGIN + col * (cellW + gutter);
          drawImageCard(ctx, cell, x, rowTop, cellW, imgH);

          let cy = rowTop - imgH - 10;
          for (const line of captionLines) {
            ctx.page.drawText(line, { x, y: cy, size: captionSize, font: ctx.bold });
            cy -= captionLineH;
          }
          for (const line of subLines) {
            ctx.page.drawText(line, {
              x,
              y: cy,
              size: subSize,
              font: ctx.font,
              color: rgb(0.4, 0.4, 0.4),
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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return { r: 0.9, g: 0.9, b: 0.88 };
  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255,
  };
}

function drawFooter(ctx: PdfContext, footerText: string): void {
  const pages = ctx.doc.getPages();
  const size = 8;
  pages.forEach((page, index) => {
    page.drawText(footerText, {
      x: MARGIN,
      y: FOOTER_Y,
      size,
      font: ctx.font,
      color: rgb(0.45, 0.45, 0.45),
    });
    page.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: PAGE_WIDTH - MARGIN - 60,
      y: FOOTER_Y,
      size,
      font: ctx.font,
      color: rgb(0.45, 0.45, 0.45),
    });
  });
}

export async function buildResourcePdf(
  blocks: PdfBlock[],
  footerText: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

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
    font,
    bold,
    y: PAGE_HEIGHT - MARGIN,
    imageCache,
  };

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
