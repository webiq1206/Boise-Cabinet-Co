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
const HEADING_SIZE = 13;
const TITLE_SIZE = 18;
const SUBTITLE_SIZE = 11;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;

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
  | { type: 'cover'; title: string; subtitle?: string; metaLines?: string[] }
  | { type: 'image-grid'; columns?: number; cells: PdfImageCell[] };

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

function ensureSpace(ctx: PdfContext, needed: number): void {
  if (ctx.y - needed < MARGIN + 40) {
    newPage(ctx);
  }
}

function wrapLine(text: string, font: PDFFont, size: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > MAX_WIDTH && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
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
      drawLines(ctx, wrapLine(block.text, ctx.font, SUBTITLE_SIZE), SUBTITLE_SIZE, ctx.font, rgb(0.35, 0.35, 0.35));
      ctx.y -= 6;
      break;
    }
    case 'heading': {
      ensureSpace(ctx, 28);
      ctx.y -= 6;
      drawLines(ctx, wrapLine(block.text, ctx.bold, HEADING_SIZE), HEADING_SIZE, ctx.bold);
      ctx.y -= 4;
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
      ensureSpace(ctx, rowH * (block.rows.length + 2));
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
        row.forEach((cell, i) => {
          const clipped =
            cell.length > 28 ? `${cell.slice(0, 26)}…` : cell;
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
    case 'cover': {
      // Vertically centered brand cover on its own page; content starts after.
      const COVER_TITLE = 30;
      ctx.y = PAGE_HEIGHT * 0.64;
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
      const columns = block.columns ?? 4;
      const gutter = 10;
      const cellW = (MAX_WIDTH - gutter * (columns - 1)) / columns;
      const imgH = cellW * 0.78;
      const captionH = 26;
      const rowH = imgH + captionH + gutter;

      for (let i = 0; i < block.cells.length; i += columns) {
        ensureSpace(ctx, rowH);
        const rowTop = ctx.y;
        const row = block.cells.slice(i, i + columns);
        row.forEach((cell, col) => {
          const x = MARGIN + col * (cellW + gutter);
          const imgTop = rowTop;
          const embedded = cell.jpeg ? ctx.imageCache.get(cell.jpeg) : undefined;
          if (embedded) {
            const scale = Math.min(cellW / embedded.width, imgH / embedded.height);
            const w = embedded.width * scale;
            const h = embedded.height * scale;
            ctx.page.drawImage(embedded, {
              x: x + (cellW - w) / 2,
              y: imgTop - h,
              width: w,
              height: h,
            });
          } else {
            // Flat color tile (finish swatch fallback) or neutral placeholder.
            const hex = cell.fallbackHex ?? '#e5e5e3';
            const c = hexToRgb(hex);
            ctx.page.drawRectangle({
              x,
              y: imgTop - imgH,
              width: cellW,
              height: imgH,
              color: rgb(c.r, c.g, c.b),
            });
          }
          // Caption + sub beneath the image.
          let cy = imgTop - imgH - 12;
          const captionLines = wrapLine(cell.caption, ctx.bold, 8).slice(0, 2);
          for (const line of captionLines) {
            ctx.page.drawText(line, { x, y: cy, size: 8, font: ctx.bold });
            cy -= 10;
          }
          if (cell.sub) {
            const subLine = wrapLine(cell.sub, ctx.font, 7)[0] ?? '';
            ctx.page.drawText(subLine, {
              x,
              y: cy,
              size: 7,
              font: ctx.font,
              color: rgb(0.4, 0.4, 0.4),
            });
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
      y: 28,
      size,
      font: ctx.font,
      color: rgb(0.45, 0.45, 0.45),
    });
    page.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: PAGE_WIDTH - MARGIN - 60,
      y: 28,
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
  for (const block of blocks) {
    if (block.type !== 'image-grid') continue;
    for (const cell of block.cells) {
      if (cell.jpeg && !imageCache.has(cell.jpeg)) {
        try {
          imageCache.set(cell.jpeg, await doc.embedJpg(cell.jpeg));
        } catch {
          // Skip undecodable images; the cell falls back to a flat tile.
        }
      }
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

  for (const block of blocks) {
    drawBlock(ctx, block);
  }

  drawFooter(ctx, footerText);
  return doc.save();
}
