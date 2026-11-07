import { phase1RoomAnswer } from "@/lib/phase1Answers";
import { generateFAQSchema } from "@/lib/schema";
import type { RoomCategory } from "@/shared/catalog/roomCategories";
import { getRoomFaqs } from "@/shared/catalog/roomFaqs";
import { bot05Room, LEAD_TIME_LINE, PANTRY_LEAD_TIME_LINE } from "@/shared/content/bot05PageCopy";
import { STANDARD_INCLUSIONS } from "@/shared/siteContent";

export type CabinetFaq = { question: string; answer: string };

const PANTRY_OMITTED_INCLUSIONS = new Set([
  "Written workmanship guarantee",
  "Warranty claims handled by us",
]);

/** Lead-time sentence shown in the cabinet page cost block. Pantry is the only override. */
export function cabinetLeadTimeLine(slug: string): string {
  return slug === "pantry" ? PANTRY_LEAD_TIME_LINE : LEAD_TIME_LINE;
}

/**
 * Inclusion lines for /cabinets/[room]. Pantry drops the two warranty lines
 * and does not replace them.
 */
export function cabinetPageInclusions(slug: string): readonly string[] {
  if (slug !== "pantry") return STANDARD_INCLUSIONS;
  return STANDARD_INCLUSIONS.filter((item) => !PANTRY_OMITTED_INCLUSIONS.has(item));
}

/**
 * Visible FAQs for one cabinet page, in on-page order, plus the FAQPage node
 * built from that same list. Bot-05 room copy wins over the shared room FAQ
 * file. Pages without that copy also show their phase-1 answer FAQs, which
 * render above the room accordion.
 */
export function cabinetPageFaqContent(room: RoomCategory): {
  phaseFaqs: CabinetFaq[];
  roomFaqs: CabinetFaq[];
  visible: CabinetFaq[];
  schema: ReturnType<typeof generateFAQSchema>;
} {
  const roomCopy = bot05Room(room.slug);
  const phaseFaqs = roomCopy ? [] : (phase1RoomAnswer(room.slug)?.faqs ?? []);
  const roomFaqs = roomCopy?.faqs ?? getRoomFaqs(room);
  const visible = [...phaseFaqs, ...roomFaqs];
  return { phaseFaqs, roomFaqs, visible, schema: generateFAQSchema(visible) };
}
