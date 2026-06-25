import { db } from "@/lib/db";
import { outreachProspects, leads } from "@/shared/schema";
import { and, eq } from "drizzle-orm";
import { deriveEmailable, matchServiceArea } from "@/lib/crm/leads";
import { scrapePublicEmail } from "@/lib/outreach/emailScraper";

/**
 * Contractor discovery via the official Google Places API (Places API "New",
 * Text Search). We only read public business listing fields (name, website,
 * phone, address). No email is ever obtained here; emails are scraped later
 * from each contractor's own public website.
 */

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

export interface DiscoveredPlace {
  googlePlaceId: string;
  businessName: string;
  website: string | null;
  phone: string | null;
  formattedAddress: string | null;
}

export interface DiscoveryResult {
  city: string;
  found: number;
  inserted: number;
  skippedExisting: number;
  error?: string;
}

function getApiKey(): string | null {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || null;
}

export function isDiscoveryConfigured(): boolean {
  return getApiKey() !== null;
}

async function searchTextPage(
  apiKey: string,
  query: string,
  pageToken?: string,
): Promise<{ places: DiscoveredPlace[]; nextPageToken?: string }> {
  const res = await fetch(PLACES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.websiteUri,places.nationalPhoneNumber,places.formattedAddress,nextPageToken",
    },
    body: JSON.stringify({
      textQuery: query,
      regionCode: "US",
      pageSize: 20,
      ...(pageToken ? { pageToken } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Places API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      websiteUri?: string;
      nationalPhoneNumber?: string;
      formattedAddress?: string;
    }>;
    nextPageToken?: string;
  };

  const places: DiscoveredPlace[] = (data.places ?? [])
    .filter((p) => p.id && p.displayName?.text)
    .map((p) => ({
      googlePlaceId: p.id as string,
      businessName: p.displayName?.text as string,
      website: p.websiteUri ?? null,
      phone: p.nationalPhoneNumber ?? null,
      formattedAddress: p.formattedAddress ?? null,
    }));

  return { places, nextPageToken: data.nextPageToken };
}

/**
 * Search general contractors in a single city and upsert new prospects.
 * Existing prospects (matched by googlePlaceId) are left untouched so we never
 * clobber an approved/sent record on a re-run.
 */
export async function discoverContractorsForCity(
  cityName: string,
  maxPages = 2,
): Promise<DiscoveryResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      city: cityName,
      found: 0,
      inserted: 0,
      skippedExisting: 0,
      error: "GOOGLE_PLACES_API_KEY is not configured.",
    };
  }
  if (!db) {
    return {
      city: cityName,
      found: 0,
      inserted: 0,
      skippedExisting: 0,
      error: "Database unavailable.",
    };
  }

  const query = `general contractor in ${cityName}, Idaho`;
  const collected: DiscoveredPlace[] = [];
  let pageToken: string | undefined;

  try {
    for (let page = 0; page < maxPages; page++) {
      const { places, nextPageToken } = await searchTextPage(apiKey, query, pageToken);
      collected.push(...places);
      if (!nextPageToken) break;
      pageToken = nextPageToken;
      // The new Places API page token is usable immediately, but a brief pause
      // keeps us well within rate limits on multi-page pulls.
      await new Promise((r) => setTimeout(r, 1200));
    }
  } catch (err) {
    return {
      city: cityName,
      found: collected.length,
      inserted: 0,
      skippedExisting: 0,
      error: err instanceof Error ? err.message : "Discovery failed.",
    };
  }

  let inserted = 0;
  let skippedExisting = 0;

  for (const place of collected) {
    const existing = await db
      .select({ id: outreachProspects.id })
      .from(outreachProspects)
      .where(eq(outreachProspects.googlePlaceId, place.googlePlaceId))
      .limit(1);

    if (existing.length > 0) {
      skippedExisting++;
      continue;
    }

    await db.insert(outreachProspects).values({
      googlePlaceId: place.googlePlaceId,
      businessName: place.businessName,
      city: cityName,
      website: place.website,
      phone: place.phone,
      formattedAddress: place.formattedAddress,
      status: place.website ? "discovered" : "skipped",
      lastError: place.website ? null : "No public website listed.",
    });
    inserted++;
  }

  return {
    city: cityName,
    found: collected.length,
    inserted,
    skippedExisting,
  };
}

export interface BusinessLeadDiscoveryResult {
  city: string;
  found: number;
  inserted: number;
  skippedExisting: number;
  emailsFound: number;
  error?: string;
}

/**
 * Unified-CRM discovery: searches general contractors in a city and inserts new
 * rows directly into `leads` as leadType=business (deduped by the Google place id
 * stored in sourceDetail). When scrapeEmails is on, each listed website is
 * checked for a single publicly-listed email and emailable is derived.
 */
export async function discoverBusinessLeadsForCity(
  cityName: string,
  options: { maxPages?: number; scrapeEmails?: boolean } = {},
): Promise<BusinessLeadDiscoveryResult> {
  const { maxPages = 2, scrapeEmails = false } = options;
  const apiKey = getApiKey();
  if (!apiKey) {
    return { city: cityName, found: 0, inserted: 0, skippedExisting: 0, emailsFound: 0, error: "GOOGLE_PLACES_API_KEY is not configured." };
  }
  if (!db) {
    return { city: cityName, found: 0, inserted: 0, skippedExisting: 0, emailsFound: 0, error: "Database unavailable." };
  }

  const query = `general contractor in ${cityName}, Idaho`;
  const collected: DiscoveredPlace[] = [];
  let pageToken: string | undefined;

  try {
    for (let page = 0; page < maxPages; page++) {
      const { places, nextPageToken } = await searchTextPage(apiKey, query, pageToken);
      collected.push(...places);
      if (!nextPageToken) break;
      pageToken = nextPageToken;
      await new Promise((r) => setTimeout(r, 1200));
    }
  } catch (err) {
    return {
      city: cityName,
      found: collected.length,
      inserted: 0,
      skippedExisting: 0,
      emailsFound: 0,
      error: err instanceof Error ? err.message : "Discovery failed.",
    };
  }

  let inserted = 0;
  let skippedExisting = 0;
  let emailsFound = 0;

  for (const place of collected) {
    const placeRef = `place:${place.googlePlaceId}`;
    const existing = await db
      .select({ id: leads.id })
      .from(leads)
      .where(and(eq(leads.leadType, "business"), eq(leads.sourceDetail, placeRef)))
      .limit(1);
    if (existing.length > 0) {
      skippedExisting++;
      continue;
    }

    let email: string | null = null;
    if (scrapeEmails && place.website) {
      try {
        const result = await scrapePublicEmail(place.website);
        email = result.email;
        if (email) emailsFound++;
      } catch {
        // Email scraping is best-effort; never block lead creation.
      }
    }

    await db.insert(leads).values({
      leadType: "business",
      emailable: deriveEmailable(email, "new"),
      companyName: place.businessName,
      name: place.businessName,
      email,
      phone: place.phone,
      website: place.website,
      city: cityName,
      serviceArea: matchServiceArea(cityName),
      fullAddress: place.formattedAddress,
      address: place.formattedAddress,
      businessCategory: "general contractor",
      source: "manual",
      sourceDetail: placeRef,
      emailStatus: "new",
      pipelineStage: "new",
      status: "accepted",
    });
    inserted++;
  }

  return { city: cityName, found: collected.length, inserted, skippedExisting, emailsFound };
}
