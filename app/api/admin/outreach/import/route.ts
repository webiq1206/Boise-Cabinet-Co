import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { outreachProspects } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

// Import contractors into the outreach list from a pasted/uploaded CSV.
//
// Imported rows land as "ready" (or "needs_email" when no address is given) and
// are NEVER auto-approved. The owner still chooses who actually gets emailed by
// approving them. This keeps a clear, deliberate gate between "in my list" and
// "will be cold-emailed".

const rowSchema = z.object({
  businessName: z.string().trim().min(1).max(300),
  city: z.string().trim().max(120).optional(),
  email: z.string().trim().max(320).optional(),
  website: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(60).optional(),
  personalizationNote: z.string().trim().max(400).optional(),
});

const bodySchema = z.object({
  csv: z.string().optional(),
  rows: z.array(z.record(z.string(), z.unknown())).optional(),
});

// Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes, and
// commas/newlines inside quotes. Good enough for spreadsheet exports.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}

const HEADER_ALIASES: Record<string, keyof z.infer<typeof rowSchema>> = {
  businessname: "businessName",
  business: "businessName",
  business_name: "businessName",
  name: "businessName",
  company: "businessName",
  city: "city",
  town: "city",
  email: "email",
  "e-mail": "email",
  emailaddress: "email",
  website: "website",
  url: "website",
  site: "website",
  phone: "phone",
  telephone: "phone",
  tel: "phone",
  note: "personalizationNote",
  notes: "personalizationNote",
  personalizationnote: "personalizationNote",
};

function normalizeHeader(h: string): keyof z.infer<typeof rowSchema> | null {
  const key = h.trim().toLowerCase().replace(/\s+/g, "");
  return HEADER_ALIASES[key] ?? null;
}

function rowsFromCsv(csv: string): Record<string, string>[] {
  const grid = parseCsv(csv);
  if (grid.length === 0) return [];
  const header = grid[0].map(normalizeHeader);
  // If no recognizable header, treat first column as businessName, second city.
  const hasHeader = header.some((h) => h !== null);
  const out: Record<string, string>[] = [];
  const dataRows = hasHeader ? grid.slice(1) : grid;
  for (const cells of dataRows) {
    const obj: Record<string, string> = {};
    if (hasHeader) {
      header.forEach((field, idx) => {
        if (field && cells[idx] !== undefined) obj[field] = cells[idx].trim();
      });
    } else {
      if (cells[0]) obj.businessName = cells[0].trim();
      if (cells[1]) obj.city = cells[1].trim();
      if (cells[2]) obj.email = cells[2].trim();
    }
    if (obj.businessName) out.push(obj);
  }
  return out;
}

function syntheticPlaceId(email: string | undefined, businessName: string, city: string): string {
  const basis = email ? `email:${email.toLowerCase()}` : `name:${businessName.toLowerCase()}|${city.toLowerCase()}`;
  return `import:${createHash("sha1").update(basis).digest("hex").slice(0, 24)}`;
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawRows: Record<string, unknown>[] = parsed.data.rows
    ? parsed.data.rows
    : parsed.data.csv
      ? rowsFromCsv(parsed.data.csv)
      : [];

  if (rawRows.length === 0) {
    return NextResponse.json({ error: "No rows found to import." }, { status: 400 });
  }
  if (rawRows.length > 2000) {
    return NextResponse.json({ error: "Too many rows. Import up to 2000 at a time." }, { status: 400 });
  }

  let inserted = 0;
  let withEmail = 0;
  let withoutEmail = 0;
  let skippedInvalid = 0;
  let duplicates = 0;
  const seenPlaceIds = new Set<string>();
  const seenEmails = new Set<string>();

  for (const raw of rawRows) {
    const result = rowSchema.safeParse(raw);
    if (!result.success) {
      skippedInvalid++;
      continue;
    }
    const r = result.data;
    const city = r.city || "Imported";
    const email = r.email && r.email.includes("@") ? r.email.toLowerCase() : undefined;
    const placeId = syntheticPlaceId(email, r.businessName, city);

    // Dedupe within this batch.
    if (seenPlaceIds.has(placeId) || (email && seenEmails.has(email))) {
      duplicates++;
      continue;
    }

    // Dedupe against existing prospects (by synthetic id, and by email).
    const existing = await db
      .select({ id: outreachProspects.id })
      .from(outreachProspects)
      .where(eq(outreachProspects.googlePlaceId, placeId))
      .limit(1);
    if (existing.length > 0) {
      duplicates++;
      continue;
    }
    if (email) {
      const byEmail = await db
        .select({ id: outreachProspects.id })
        .from(outreachProspects)
        .where(eq(outreachProspects.email, email))
        .limit(1);
      if (byEmail.length > 0) {
        duplicates++;
        continue;
      }
    }

    await db.insert(outreachProspects).values({
      googlePlaceId: placeId,
      businessName: r.businessName,
      city,
      website: r.website || null,
      phone: r.phone || null,
      email: email ?? null,
      emailSourceUrl: email ? "imported by admin" : null,
      status: email ? "ready" : "needs_email",
      personalizationNote: r.personalizationNote || null,
    });

    inserted++;
    seenPlaceIds.add(placeId);
    if (email) {
      seenEmails.add(email);
      withEmail++;
    } else {
      withoutEmail++;
    }
  }

  return NextResponse.json({
    inserted,
    withEmail,
    withoutEmail,
    duplicates,
    skippedInvalid,
    total: rawRows.length,
  });
}
