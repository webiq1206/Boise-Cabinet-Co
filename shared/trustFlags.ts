/**
 * Unproven public claims stay in source. They publish only when the matching
 * flag is exactly "true". Unset, empty, or any other value stays hidden.
 * NEXT_PUBLIC_ is read as well so client bundles follow the same switch.
 */
export const IDAHO_REGISTERED_CONTRACTOR = "Idaho Registered Contractor #8381215";

const LEGACY_LICENSED_ORG = "Licensed, insured, and committed to craftsmanship.";

function on(value: string | undefined): boolean {
  return value === "true";
}

export function showFinishCounts(): boolean {
  return on(process.env.NEXT_PUBLIC_SHOW_FINISH_COUNTS) || on(process.env.SHOW_FINISH_COUNTS);
}

export function showLifetimeWarranty(): boolean {
  return on(process.env.NEXT_PUBLIC_SHOW_LIFETIME_WARRANTY) || on(process.env.SHOW_LIFETIME_WARRANTY);
}

export function showFoundingYear(): boolean {
  return on(process.env.NEXT_PUBLIC_SHOW_FOUNDING_YEAR) || on(process.env.SHOW_FOUNDING_YEAR);
}

export function showWorkmanshipGuarantee(): boolean {
  return on(process.env.NEXT_PUBLIC_SHOW_WORKMANSHIP_GUARANTEE) || on(process.env.SHOW_WORKMANSHIP_GUARANTEE);
}

export function showBuildClaims(): boolean {
  return on(process.env.NEXT_PUBLIC_SHOW_BUILD_CLAIMS) || on(process.env.SHOW_BUILD_CLAIMS);
}

export function showPremierClaim(): boolean {
  return on(process.env.NEXT_PUBLIC_SHOW_PREMIER_CLAIM) || on(process.env.SHOW_PREMIER_CLAIM);
}

export function showTestimonials(): boolean {
  return on(process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS) || on(process.env.SHOW_TESTIMONIALS);
}

export function showLegacyLicenseWording(): boolean {
  return on(process.env.NEXT_PUBLIC_SHOW_LEGACY_LICENSE_WORDING) || on(process.env.SHOW_LEGACY_LICENSE_WORDING);
}

function replaceAll(text: string, pairs: Array<[string, string]>): string {
  let next = text;
  for (const [from, to] of pairs) next = next.split(from).join(to);
  return next.replace(/[ ]{2,}/g, " ").replace(/ +([,.])/g, "$1");
}

/** Keep the source sentence. Return the wording that is allowed to publish. */
export function publishTrustText(text: string): string {
  let next = text;
  if (!showLegacyLicenseWording()) {
    next = replaceAll(next, [
      [LEGACY_LICENSED_ORG, `${IDAHO_REGISTERED_CONTRACTOR}, insured, and committed to craftsmanship.`],
      ["Fully Licensed & Insured", `${IDAHO_REGISTERED_CONTRACTOR}, insured`],
      ["Licensed & insured.", `${IDAHO_REGISTERED_CONTRACTOR}, insured.`],
      ["Yes. Boise Cabinet Co is licensed, bonded, and insured. License details available upon request.", `Yes. Boise Cabinet Co is ${IDAHO_REGISTERED_CONTRACTOR}, bonded, and insured.`],
      ["Licensed, bonded, and insured", `${IDAHO_REGISTERED_CONTRACTOR}, bonded, and insured`],
      ["Idaho contractor license information is available upon request.", `${IDAHO_REGISTERED_CONTRACTOR}.`],
      ["License details available upon request.", `${IDAHO_REGISTERED_CONTRACTOR}.`],
      ["Are you licensed and insured?", "Are you a registered contractor and insured?"],
      ["licensed and insured?", "a registered contractor and insured?"],
    ]);
  }
  if (!showPremierClaim()) {
    next = replaceAll(next, [
      ["Idaho's Premier Custom Cabinet Company", "Custom cabinet company in the Treasure Valley"],
      ["Idaho's premier custom cabinet company", "Custom cabinet company in the Treasure Valley"],
      ["Idaho premier custom cabinet company", "Custom cabinet company in the Treasure Valley"],
    ]);
  }
  if (!showFinishCounts()) {
    next = replaceAll(next, [
      ["6 door styles, 299 finishes, 382 cabinet configurations", "six door styles and a wide cabinet configuration range"],
      ["299 finishes and six door styles", "six door styles and a wide finish selection"],
      ["299 finishes. Six door styles.", "Six door styles. Finish choices."],
      ["hundreds of finishes and six door styles", "six door styles and a wide finish selection"],
      ["Hundreds of finishes and six door styles", "Six door styles and a wide finish selection"],
      ["Choose from hundreds of finishes and six door styles.", "Choose from six door styles and a wide finish selection."],
      ["hundreds of finishes", "a wide finish selection"],
      ["Hundreds of finishes", "A wide finish selection"],
      ["299 cabinet finishes", "cabinet finish choices"],
      ["299 options total", "a wide finish selection"],
      ["our 299 finishes", "our finish library"],
      ["299 finishes", "finish choices"],
      ["(299 options)", "(finish library)"],
    ]);
  }
  if (!showLifetimeWarranty()) {
    next = replaceAll(next, [
      ["free from defects in materials and workmanship for the lifetime of original home ownership", "covered under written terms available on request"],
      ["Coverage for the lifetime of original home ownership", "Coverage terms are available on request"],
      ["publishes limited lifetime coverage", "publishes coverage terms on request"],
      ["backed by a limited lifetime workmanship warranty", "with warranty terms available on request"],
      ["limited lifetime workmanship warranty", "warranty terms available on request"],
      ["a lifetime workmanship warranty", "warranty terms available on request"],
      ["lifetime workmanship warranty", "warranty terms available on request"],
      ["limited lifetime cabinet warranty", "cabinet warranty terms available on request"],
      ["limited lifetime coverage", "coverage terms on request"],
      ["Limited lifetime warranty", "Warranty terms"],
      ["limited lifetime warranty", "warranty terms available on request"],
      ["A limited lifetime warranty", "Warranty terms"],
      ["Our limited lifetime warranty", "Our warranty terms"],
      ["backed by a lifetime warranty", "with warranty terms available on request"],
      ["a lifetime warranty", "warranty terms available on request"],
      ["Lifetime warranty support", "Warranty support"],
      ["Lifetime · Limited warranty · View terms", "Warranty terms"],
    ]);
  }
  if (!showFoundingYear()) {
    next = replaceAll(next, [
      ["When was Boise Cabinet Co founded, and is workmanship in writing?", "Is the project scope in writing?"],
      ["Boise Cabinet Co was founded in 2020 and provides a written workmanship guarantee.", "Boise Cabinet Co provides a written project scope."],
      ["was founded in 2020 and ", ""],
      ["Founded Boise Cabinet Co in 2020", "Leads Boise Cabinet Co"],
      ["Founded in 2020, the shop includes", "The company includes"],
      ["Founded in 2020, the company offers", "The company offers"],
      ["Founded in 2020, we offer", "We offer"],
      [". Founded in 2020, ", ". "],
      ["Contact Boise Cabinet Co, founded in 2020, for", "Contact Boise Cabinet Co for"],
      [", founded in 2020, includes", " includes"],
      [", founded in 2020.", "."],
      [", founded in 2020,", ","],
      ["Founded in 2020, ", ""],
      [" since 2020", ""],
      ["founded in 2020", ""],
      ["Founded: 2020", "Founded: on file"],
    ]);
  }
  if (!showWorkmanshipGuarantee()) {
    next = replaceAll(next, [
      [" and provides a written workmanship guarantee", ""],
      [" and a written workmanship guarantee", ""],
      [" with a written workmanship guarantee", ""],
      [", and a written workmanship guarantee", ""],
      ["provides a written workmanship guarantee", "provides a written project scope"],
      ["The workmanship guarantee", "The written project scope"],
      ["Workmanship Guarantee", "Project scope"],
      ["Workmanship guarantee", "Project scope"],
      ["written workmanship guarantee", "written project scope"],
      ["written workmanship warranty", "written project scope"],
      ["workmanship guarantee", "project scope"],
    ]);
  }
  if (!showBuildClaims()) {
    next = replaceAll(next, [
      ["Doors are CNC-routed and hand-finished in our Meridian shop. ", ""],
      ["Built to order in Meridian and installed by our own crew", "Installed by our own crew"],
      ["Built to order in Meridian, Idaho.", ""],
      ["built to order in Meridian, Idaho", "sized for the project"],
      ["built to order in Meridian", "sized for each project"],
      ["Built to order in Meridian", "Sized for the project"],
      ["Every shaker cabinet is built to order in our Meridian, Idaho shop and sized to your layout", "Every shaker cabinet is sized to your layout"],
      ["We build it to order", "We offer it"],
      ["in our Meridian, Idaho shop", "for Treasure Valley homes"],
      ["Built to order and sized to your layout in Meridian, Idaho", "Sized to your layout in Meridian, Idaho"],
      ["We build to order in our Meridian shop, then deliver and install", "We deliver and install"],
      ["Design, fabrication, and installation run out of our Meridian shop under a single project contact.", "Design and installation run under a single project contact."],
      ["One local shop, one point of contact", "One point of contact"],
      ["Design, fabrication, and installation stay under one roof", "Design and installation stay with one team"],
      ["Design, fabrication, and installation stay with one cabinet team", "Design and installation stay with one cabinet team"],
      ["design, fabrication, and installation", "design and installation"],
      ["We bring the layout, fabrication, and installation together.", "We bring the layout and installation together."],
      ["quotes cover fabrication, delivery, and professional installation by our own team", "quotes cover delivery and professional installation by our own team"],
      ["fabrication by our own team", "installation by our own team"],
      ["shop fabrication, delivery, and professional installation", "delivery and professional installation"],
      ["a written scope and planning range, fabrication, and professional installation", "a written scope and planning range, and professional installation"],
      ["panels cut, boxes assembled, doors finished", "the order confirmed, delivery scheduled, and installation planned"],
      ["Premium custom cabinets, designed, built, and installed by one accountable team.", "Premium custom cabinets, designed and installed by one accountable team."],
      ["designed, built, and installed", "designed and installed"],
      ["We design, build, and install", "We design and install"],
      ["we design, build, and install", "we design and install"],
      ["Design, build, and installation", "Design and installation"],
      ["design, build, and install", "design and install"],
      ["Your cabinets are built to order", "Your cabinets are specified for the project"],
      ["Your cabinets are made to order", "Your cabinets are specified for the project"],
      ["the cabinets are built to order", "the cabinets are made for the project"],
      ["cabinets are built to order", "cabinets are made for the project"],
      ["built-to-order", "made-to-measure"],
      ["Built-to-order", "Made-to-measure"],
      ["Made to order for everyday life.", "Specified for everyday life."],
      ["made to order", "specified for the project"],
      ["Made to order", "Specified for the project"],
      ["built to order", "made for the project"],
      ["Built to Order", "Made for the project"],
      ["Built to order", "Made for the project"],
      ["We keep our shop lean", "We keep overhead lean"],
      ["See how we build.", "See the construction details."],
      ["How {company} builds custom cabinets", "How {company} specifies custom cabinets"],
      ["A written plan before fabrication", "A written plan before ordering"],
      ["a written scope before fabrication", "a written scope before ordering"],
      ["before fabrication begins", "before ordering begins"],
      ["before fabrication", "before ordering"],
      ["Fabrication & quality check", "Quality check"],
      ["Design, fabrication, delivery", "Design, ordering, delivery"],
    ]);
  }
  if (!showTestimonials()) {
    next = next.replace(/\n- \[Projects and reviews\]\(https:\/\/boisecabinet\.co\/testimonials\)/, "");
  }
  return next;
}

export function publishDeep<T>(value: T): T {
  if (typeof value === "string") return publishTrustText(value) as T;
  if (Array.isArray(value)) return value.map((item) => publishDeep(item)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[key] = publishDeep(entry);
    }
    return out as T;
  }
  return value;
}
