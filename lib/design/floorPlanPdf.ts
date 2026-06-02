import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { buildFloorPlanSvg } from "./floorPlanExport";
import type { CabinetModule, RoomBounds } from "./previewConfig";
import type { RoomMeta } from "./roomMeta";
import { detectIssues } from "./planAdvisor";

export async function buildFloorPlanPdf(input: {
  modules: CabinetModule[];
  bounds: RoomBounds;
  roomMeta: RoomMeta | null;
  designName?: string;
}): Promise<Uint8Array> {
  const svg = buildFloorPlanSvg(input);
  const issues = detectIssues(input.modules, input.bounds, input.roomMeta);

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([612, 792]);
  const { width, height } = page.getSize();
  const margin = 48;

  const title = input.designName || "Cabinet layout";
  page.drawText(title, {
    x: margin,
    y: height - margin,
    size: 18,
    font: bold,
    color: rgb(0.23, 0.24, 0.24),
  });

  const dims = input.roomMeta
    ? `${input.roomMeta.widthIn}" × ${input.roomMeta.depthIn}"`
    : "Room size from scan";
  page.drawText(dims, {
    x: margin,
    y: height - margin - 22,
    size: 11,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(
    "Planning document only — confirm dimensions at site measure before order.",
    {
      x: margin,
      y: height - margin - 38,
      size: 9,
      font,
      color: rgb(0.55, 0.55, 0.55),
    },
  );

  let y = height - margin - 60;
  page.drawText("Layout notes", { x: margin, y, size: 12, font: bold });
  y -= 16;

  if (issues.length === 0) {
    page.drawText("No layout issues detected.", { x: margin, y, size: 10, font });
    y -= 14;
  } else {
    for (const issue of issues.slice(0, 12)) {
      page.drawText(`• ${issue.title}`, { x: margin, y, size: 10, font });
      y -= 14;
      if (y < margin + 120) break;
    }
  }

  y -= 8;
  page.drawText("Modules", { x: margin, y, size: 12, font: bold });
  y -= 16;
  for (const m of input.modules.slice(0, 24)) {
    const line = `${m.id.replace(/-/g, " ")} — ${Math.round(m.width / 0.0254)}"W`;
    page.drawText(line, { x: margin, y, size: 9, font });
    y -= 12;
    if (y < margin + 80) break;
  }

  page.drawText(
    "Floor plan graphic: export SVG from Design Studio for CAD-ready detail.",
    {
      x: margin,
      y: margin,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
      maxWidth: width - margin * 2,
    },
  );

  void svg;

  return pdf.save();
}

export function downloadFloorPlanPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
