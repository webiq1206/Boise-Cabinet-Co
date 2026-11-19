/**
 * Local search wording for image descriptions (owner, 19 November 2026: every
 * image on every page carries an alt that names the work and the place).
 *
 * The form is "<work> in <city>, Idaho: <what the picture shows>". The part
 * after the colon stays a plain account of what is in the frame, for screen
 * readers. Owner direction, same day: no qualifier such as "idea", "concept",
 * "inspiration" or "representative" in or beside an image description.
 */

export interface LocalAltContext {
  /** The work the page is about: "kitchen cabinets", "bathroom vanities". Inferred from the description when omitted. */
  subject?: string;
  /** City name without the state. Defaults to Boise. */
  city?: string;
}

const CITY_NAMES = ['Boise', 'Meridian', 'Eagle', 'Nampa', 'Kuna', 'Star', 'Middleton', 'Caldwell'];

/** The work a description is about, from the words it already uses. First match wins. */
const SUBJECT_RULES: readonly [RegExp, string][] = [
  [/door (profile|style)|cabinet door\b/i, 'cabinet door styles'],
  [/finish swatch|cabinet finish|finish sample/i, 'cabinet finishes'],
  [/front elevation|line drawing/i, 'custom cabinets'],
  [/pantry/i, 'pantry cabinets'],
  [/laundry/i, 'laundry room cabinets'],
  [/mudroom|locker/i, 'mudroom cabinets'],
  [/closet|wardrobe/i, 'closet cabinets'],
  [/office|desk/i, 'home office cabinets'],
  [/entertainment|media wall|television|\bTV\b/i, 'entertainment center cabinets'],
  [/built-in|bookshel|fireplace/i, 'built-in cabinets'],
  [/vanity|bathroom|\bbath\b/i, 'bathroom vanities'],
  [/kitchen|island|range|backsplash/i, 'kitchen cabinets'],
  [/garage/i, 'garage cabinets'],
  [/outdoor/i, 'outdoor kitchen cabinets'],
  [/drawer|hardware|pull|knob|hinge/i, 'cabinet hardware and drawers'],
  [/install/i, 'cabinet installation'],
];

export function subjectFromDescription(description: string): string {
  for (const [pattern, subject] of SUBJECT_RULES) if (pattern.test(description)) return subject;
  return 'custom cabinets';
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Lower the first letter unless the description opens with a name, a number or an acronym. */
function lowerFirst(text: string): string {
  const first = text.split(/\s+/)[0] ?? '';
  const second = text.split(/\s+/)[1] ?? '';
  if (/^[A-Z]{2,}|^\d/.test(first) || CITY_NAMES.includes(first.replace(/[^A-Za-z]/g, ''))) return text;
  // A product or finish name ("Macaron Green finish swatch", "Modern Shaker door profile") keeps its capitals.
  if (/(finish swatch|door profile|front elevation|cabinet finish|door style)$/i.test(text)) return text;
  if (/^[A-Z]/.test(second) || /^(Shaker|Slab|Alpha|Beta|Thin|Modern|Idaho|Treasure|Ada|Canyon|P5)\b/.test(first)) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** The city a string names, if any. */
export function cityIn(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return CITY_NAMES.find((name) => new RegExp(`\\b${name}\\b`).test(text));
}

export function localAlt(description: string | undefined | null, context: LocalAltContext = {}): string {
  // Drop the older "| Boise Cabinet Co" and "in <place> | brand" tails so the new form is the only one.
  const text = (description ?? '').trim().replace(/\s*\|\s*Boise Cabinet Co\s*$/i, '').replace(/,\s*Boise Cabinet Co\s*$/i, '').replace(/\.$/, '').trim();
  if (!text) return '';
  if (/\bIdaho\b/.test(text)) return text;
  const tail = text.match(/^(.*) in (Boise|Meridian|Eagle|Nampa|Kuna|Star|Middleton|Caldwell|the Treasure Valley)$/);
  const picture = tail ? tail[1] : text;
  const tailCity = tail && tail[2] !== 'the Treasure Valley' ? tail[2] : undefined;
  const subject = capitalise((context.subject ?? subjectFromDescription(picture)).trim());
  const city = (context.city ?? tailCity ?? 'Boise').replace(/,\s*Idaho$/i, '').trim();
  return `${subject} in ${city}, Idaho: ${lowerFirst(picture)}`;
}
