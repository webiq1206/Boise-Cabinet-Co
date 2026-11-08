/**
 * Search copy for the 13 room pages (/cabinets/[room]): one place for the
 * title, the H1 and the noun phrase the template reuses in its headings.
 *
 * - title: "{Room} Cabinets in Boise | {benefit}". The layout appends
 *   " | Boise Cabinet Co", so every title stays at or under 41 characters here
 *   (60 rendered).
 * - h1Lead: rendered as "{h1Lead} <em>Boise, Idaho</em>", giving the
 *   "{Room} cabinets in Boise, Idaho" pattern. Kitchen and pantry take theirs
 *   from BOT-05 copy (shared/content/bot05PageCopy.ts), which uses the same
 *   pattern. "Built-In cabinets" keeps its capital I: the approved first-screen
 *   spec (e2e/mobile-above-fold.spec.ts) pins that exact headline text.
 * - phrase: lowercase noun phrase for headings ("What to expect for built-in
 *   cabinets"), so the template never builds "built-ins cabinets".
 * - label: lowercase room name for sentences ("every laundry room project").
 * - description: only where the room has no entry in lib/phase1SearchCopy.ts.
 */
export type RoomSeo = {
  title: string;
  h1Lead: string;
  phrase: string;
  label: string;
  description?: string;
};

export const ROOM_SEO: Record<string, RoomSeo> = {
  kitchen: {
    title: "Kitchen Cabinets in Boise | Built to Fit",
    h1Lead: "Kitchen cabinets in",
    phrase: "kitchen cabinets",
    label: "kitchen",
    description:
      "Kitchen cabinets in Boise, Idaho: built to your layout in 299 finishes and six door styles, with managed installation. Book a free in-home design consult.",
  },
  bathroom: {
    title: "Bathroom Vanities in Boise | Built to Fit",
    h1Lead: "Bathroom vanities and cabinets in",
    phrase: "bathroom vanities",
    label: "bathroom",
    description:
      "Bathroom vanities in Boise, Idaho: single and double vanities built to your layout in 299 finishes, with managed installation. Book a free design consult.",
  },
  laundry: {
    title: "Laundry Room Cabinets in Boise | Custom",
    h1Lead: "Laundry room cabinets in",
    phrase: "laundry room cabinets",
    label: "laundry room",
  },
  mudroom: {
    title: "Mudroom Cabinets in Boise | Built to Fit",
    h1Lead: "Mudroom cabinets in",
    phrase: "mudroom cabinets",
    label: "mudroom",
  },
  "home-office": {
    title: "Home Office Cabinets in Boise | Installed",
    h1Lead: "Home office cabinets in",
    phrase: "home office cabinets",
    label: "home office",
  },
  entertainment: {
    title: "Entertainment Cabinets in Boise | Custom",
    h1Lead: "Entertainment center cabinets in",
    phrase: "entertainment center cabinets",
    label: "entertainment center",
  },
  "built-ins": {
    title: "Built-In Cabinets in Boise | Made to Fit",
    h1Lead: "Built-In cabinets in",
    phrase: "built-in cabinets",
    label: "built-in",
  },
  pantry: {
    title: "Pantry Cabinets in Boise | Built to Fit",
    h1Lead: "Pantry cabinets in",
    phrase: "pantry cabinets",
    label: "pantry",
  },
  closet: {
    title: "Closet Cabinets in Boise | Built to Fit",
    h1Lead: "Closet cabinets in",
    phrase: "closet cabinets",
    label: "closet",
  },
  garage: {
    title: "Garage Cabinets in Boise | Built to Fit",
    h1Lead: "Garage cabinets in",
    phrase: "garage cabinets",
    label: "garage",
  },
  outdoor: {
    title: "Outdoor Kitchen Cabinets Boise | Custom",
    h1Lead: "Outdoor kitchen cabinets in",
    phrase: "outdoor kitchen cabinets",
    label: "outdoor kitchen",
  },
  "wet-bar": {
    title: "Wet Bar Cabinets in Boise | Built to Fit",
    h1Lead: "Wet bar cabinets in",
    phrase: "wet bar cabinets",
    label: "wet bar",
  },
  bedroom: {
    title: "Bedroom Cabinets in Boise | Built to Fit",
    h1Lead: "Bedroom cabinets in",
    phrase: "bedroom cabinets",
    label: "bedroom",
  },
};

/** Room SEO with a safe fallback for any room added later. */
export function roomSeo(room: { slug: string; name: string }): RoomSeo {
  const known = ROOM_SEO[room.slug];
  if (known) return known;
  const label = room.name.toLowerCase();
  return {
    title: `${room.name} Cabinets in Boise`,
    h1Lead: `${room.name} cabinets in`,
    phrase: `${label} cabinets`,
    label,
  };
}

/** Sentence-case a phrase for use at the start of a heading. */
export function sentenceStart(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
