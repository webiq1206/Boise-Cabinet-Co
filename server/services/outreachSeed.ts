import { db } from "@/lib/db";
import { emailTemplates, sequences, sequenceSteps } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { SITE_CONFIG } from "@/shared/siteConfig";

// Seeds managed email templates and the six on-brand sequences. Idempotent:
// templates are refreshed only while seedManaged stays true (an operator edit
// flips it off and is never overwritten); seeded sequences are created once and
// then left alone. No em dashes anywhere in this copy (house style).

const SITE = SITE_CONFIG.siteUrl.replace(/\/$/, "");
const SIGNER = "The Boise Cabinet Co team";

interface SeedTemplate {
  id: string;
  name: string;
  audience: "homeowner" | "business" | "any";
  subject: string;
  openingLine: string;
  mainMessage: string;
  closingLine: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

const TEMPLATES: SeedTemplate[] = [
  // 1. New Quote Request (homeowner)
  {
    id: "new-quote-request-1",
    name: "New Quote Request: Welcome",
    audience: "homeowner",
    subject: "Your {projectType} estimate from Boise Cabinet Co",
    openingLine: "Thanks for reaching out about your {projectType} in {city}.",
    mainMessage:
      "We put together a planning range of {planningRange} based on what you shared. This is a starting point, not a final quote. The next step is a free in-home design visit where we confirm measurements, finishes, and an exact written scope before any work begins.\n\nWe build frameless cabinetry to order with soft-close hardware, backed by a limited lifetime workmanship warranty.",
    closingLine: "Reply to this email or call us and we will get your design visit on the calendar.",
    ctaLabel: "Book your free design visit",
    ctaUrl: `${SITE}/consultation`,
  },
  {
    id: "new-quote-request-2",
    name: "New Quote Request: Follow Up",
    audience: "homeowner",
    subject: "Still thinking about your {projectType}?",
    openingLine: "Just checking in on your {projectType} plans.",
    mainMessage:
      "Your planning range of {planningRange} still stands. If it would help to see real finishes and door styles in person, your free design visit is the easiest way to move forward with confidence.\n\nThere is no pressure and no obligation. We will simply measure, listen, and give you a clear written scope.",
    closingLine: "When you are ready, pick a time that works for you.",
    ctaLabel: "Schedule a visit",
    ctaUrl: `${SITE}/consultation`,
  },
  // 2. Estimator Follow-Up (homeowner)
  {
    id: "estimator-follow-up-1",
    name: "Estimator Follow-Up: Your numbers",
    audience: "homeowner",
    subject: "A closer look at your {projectType} estimate",
    openingLine: "You recently used our estimator for a {projectType} in {serviceArea}.",
    mainMessage:
      "Your planning range came out to {planningRange}. Where a project lands inside that range depends on door style, finish, and layout changes. We can walk you through the choices that move the number most, so you can plan a budget you feel good about.",
    closingLine: "Want us to refine the estimate with a quick in-home visit?",
    ctaLabel: "Get an exact scope",
    ctaUrl: `${SITE}/consultation`,
  },
  {
    id: "estimator-follow-up-2",
    name: "Estimator Follow-Up: Design ideas",
    audience: "homeowner",
    subject: "Ideas for your {projectType}",
    openingLine: "Planning a {projectType} is more fun with a few ideas to react to.",
    mainMessage:
      "We offer 299 finishes and six door styles, all built to order. Browsing our collections is a great way to narrow down a look before your design visit, and it makes the visit faster and more productive.",
    closingLine: "Take a look, then let us know what catches your eye.",
    ctaLabel: "Browse collections",
    ctaUrl: `${SITE}/collections`,
  },
  // 3. Consultation Nurture (homeowner)
  {
    id: "consultation-nurture-1",
    name: "Consultation Nurture: What to expect",
    audience: "homeowner",
    subject: "What happens at your design visit",
    openingLine: "We are looking forward to your design visit in {city}.",
    mainMessage:
      "Here is what to expect. We measure your space, talk through how you use it, and show you finishes and door styles in person. You leave with a clear written scope and an exact price, with no surprises later.\n\nOne accountable team handles your project from first sketch to final walkthrough.",
    closingLine: "If anything changes, just reply and we will adjust.",
    ctaLabel: "Review your details",
    ctaUrl: `${SITE}/consultation`,
  },
  {
    id: "consultation-nurture-2",
    name: "Consultation Nurture: Why local matters",
    audience: "homeowner",
    subject: "Built local, built to last",
    openingLine: "A quick note on why working with a local cabinet maker matters.",
    mainMessage:
      "We handle Ada and Canyon County projects with local permit and schedule know-how. Because we build to order here in the Treasure Valley, you get accountability at every step and cabinetry made for our dry climate and freeze-thaw seasons.",
    closingLine: "Questions before your visit? Reply any time.",
    ctaLabel: "See our process",
    ctaUrl: `${SITE}/guides`,
  },
  // 4. Lead Magnet (homeowner)
  {
    id: "lead-magnet-1",
    name: "Lead Magnet: Planning guide",
    audience: "homeowner",
    subject: "Your cabinet planning guide is here",
    openingLine: "Thanks for downloading our planning guide.",
    mainMessage:
      "Inside you will find budgeting ranges, a finish and door style overview, and a simple checklist to get your {projectType} moving. When you are ready to turn ideas into an exact scope, a free in-home visit is the next step.",
    closingLine: "Have a question while you read? Just reply.",
    ctaLabel: "Plan your project",
    ctaUrl: `${SITE}/consultation`,
  },
  {
    id: "lead-magnet-2",
    name: "Lead Magnet: Ready when you are",
    audience: "homeowner",
    subject: "From inspiration to installed",
    openingLine: "Hope the planning guide gave you a clear starting point.",
    mainMessage:
      "When you want a real number for your space, we will measure, confirm finishes, and put it all in a written scope before fabrication. No pressure, just a clear plan and an honest price.",
    closingLine: "Reach out whenever the timing feels right.",
    ctaLabel: "Book a design visit",
    ctaUrl: `${SITE}/consultation`,
  },
  // 5. Contractor Partnership Outreach (business only)
  {
    id: "contractor-partnership-1",
    name: "Contractor Partnership: Intro",
    audience: "business",
    subject: "Cabinet partner for {business} in {serviceArea}",
    openingLine: "I came across {business} while looking at builders doing quality work in {serviceArea}.",
    mainMessage:
      "We are Boise Cabinet Co, a local shop building frameless cabinetry to order for kitchens, vanities, and built-ins. We work well as the cabinet partner on remodels and new builds, with a written scope before fabrication and one accountable contact start to finish.\n\nA quick reason builders work with us on pricing: [PLACEHOLDER: contractor pricing reason].",
    closingLine: "Open to a short call to see if we are a fit on an upcoming project?",
    ctaLabel: "See our work",
    ctaUrl: `${SITE}/collections`,
  },
  {
    id: "contractor-partnership-2",
    name: "Contractor Partnership: Follow Up",
    audience: "business",
    subject: "Following up: cabinets for {business}",
    openingLine: "Following up on partnering with {business} on cabinetry.",
    mainMessage:
      "We keep things simple for our builder partners: clear scopes, dependable communication, and cabinetry built for the Treasure Valley. Our current lead time is [PLACEHOLDER: committed lead time], so we can plan around your schedule.",
    closingLine: "Happy to send examples relevant to your projects if useful.",
    ctaLabel: "Start a conversation",
    ctaUrl: `${SITE}/consultation`,
  },
  // 6. Re-Engagement (any)
  {
    id: "re-engagement-1",
    name: "Re-Engagement: Still planning?",
    audience: "any",
    subject: "Are your {projectType} plans still on?",
    openingLine: "It has been a little while since we last connected about your {projectType}.",
    mainMessage:
      "Plans change, and that is completely fine. If cabinetry is still on your list, we would love to help with a free in-home design visit and an exact written scope. If the timing is not right, no problem at all.",
    closingLine: "Just reply to let us know where things stand.",
    ctaLabel: "Pick up where we left off",
    ctaUrl: `${SITE}/consultation`,
  },
  // Reference emails A and B (authored to standard; not part of a sequence).
  {
    id: "reference-email-a",
    name: "Reference Email A (homeowner standard)",
    audience: "homeowner",
    subject: "Your {projectType}, planned with confidence",
    openingLine: "Thanks for considering Boise Cabinet Co for your {projectType} in {city}.",
    mainMessage:
      "Here is how we work. We start with a free in-home design visit, confirm finishes and measurements, and give you a written scope and exact price before any fabrication begins. Everything is built to order with soft-close hardware and backed by a limited lifetime workmanship warranty.\n\nYour planning range is {planningRange}, and we will refine it together at your visit.",
    closingLine: "Reply with a couple of times that work and we will take it from there.",
    ctaLabel: "Book your design visit",
    ctaUrl: `${SITE}/consultation`,
  },
  {
    id: "reference-email-b",
    name: "Reference Email B (business standard)",
    audience: "business",
    subject: "A reliable cabinet partner for {business}",
    openingLine: "I wanted to introduce Boise Cabinet Co as a cabinet partner for {business}.",
    mainMessage:
      "We build frameless cabinetry to order for builders and remodelers across the Treasure Valley, with clear written scopes and one accountable contact from first sketch to final install. Builders partner with us because [PLACEHOLDER: contractor pricing reason], and our current lead time is [PLACEHOLDER: committed lead time].",
    closingLine: "Would a short call this week be worthwhile?",
    ctaLabel: "See examples",
    ctaUrl: `${SITE}/collections`,
  },
];

interface SeedSequence {
  seedKey: string;
  name: string;
  description: string;
  audience: "homeowner" | "business" | "any";
  steps: { templateId: string; delayHours: number }[];
}

const SEQUENCES: SeedSequence[] = [
  {
    seedKey: "new-quote-request",
    name: "New Quote Request",
    description: "Welcome and follow up for new homeowner quote requests.",
    audience: "homeowner",
    steps: [
      { templateId: "new-quote-request-1", delayHours: 0 },
      { templateId: "new-quote-request-2", delayHours: 72 },
    ],
  },
  {
    seedKey: "estimator-follow-up",
    name: "Estimator Follow-Up",
    description: "Re-engage homeowners who used the estimator.",
    audience: "homeowner",
    steps: [
      { templateId: "estimator-follow-up-1", delayHours: 1 },
      { templateId: "estimator-follow-up-2", delayHours: 96 },
    ],
  },
  {
    seedKey: "consultation-nurture",
    name: "Consultation Nurture",
    description: "Prepare booked homeowners for their design visit.",
    audience: "homeowner",
    steps: [
      { templateId: "consultation-nurture-1", delayHours: 0 },
      { templateId: "consultation-nurture-2", delayHours: 48 },
    ],
  },
  {
    seedKey: "lead-magnet",
    name: "Lead Magnet",
    description: "Nurture homeowners who downloaded a planning resource.",
    audience: "homeowner",
    steps: [
      { templateId: "lead-magnet-1", delayHours: 0 },
      { templateId: "lead-magnet-2", delayHours: 120 },
    ],
  },
  {
    seedKey: "contractor-partnership",
    name: "Contractor Partnership Outreach",
    description: "Introduce Boise Cabinet Co to local builders. Business only.",
    audience: "business",
    steps: [
      { templateId: "contractor-partnership-1", delayHours: 0 },
      { templateId: "contractor-partnership-2", delayHours: 120 },
    ],
  },
  {
    seedKey: "re-engagement",
    name: "Re-Engagement",
    description: "Reconnect with quiet leads. Homeowner or business.",
    audience: "any",
    steps: [{ templateId: "re-engagement-1", delayHours: 0 }],
  },
];

export async function seedOutreachContent(): Promise<void> {
  if (!db) return;

  // Templates: insert if missing; refresh only while still seed-managed.
  for (const t of TEMPLATES) {
    const [existing] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, t.id)).limit(1);
    if (!existing) {
      await db.insert(emailTemplates).values({
        id: t.id,
        name: t.name,
        audience: t.audience,
        subject: t.subject,
        openingLine: t.openingLine,
        mainMessage: t.mainMessage,
        closingLine: t.closingLine,
        signerName: SIGNER,
        ctaLabel: t.ctaLabel ?? null,
        ctaUrl: t.ctaUrl ?? null,
        seedManaged: true,
        updatedAt: new Date(),
      });
    } else if (existing.seedManaged) {
      await db
        .update(emailTemplates)
        .set({
          name: t.name,
          audience: t.audience,
          subject: t.subject,
          openingLine: t.openingLine,
          mainMessage: t.mainMessage,
          closingLine: t.closingLine,
          signerName: SIGNER,
          ctaLabel: t.ctaLabel ?? null,
          ctaUrl: t.ctaUrl ?? null,
          updatedAt: new Date(),
        })
        .where(eq(emailTemplates.id, t.id));
    }
  }

  // Sequences: create once per seedKey, then leave alone.
  for (const s of SEQUENCES) {
    const [existing] = await db.select().from(sequences).where(eq(sequences.seedKey, s.seedKey)).limit(1);
    if (existing) continue;
    const [seq] = await db
      .insert(sequences)
      .values({ name: s.name, description: s.description, audience: s.audience, seedKey: s.seedKey })
      .returning();
    if (s.steps.length > 0) {
      await db.insert(sequenceSteps).values(
        s.steps.map((step, i) => ({
          sequenceId: seq.id,
          templateId: step.templateId,
          stepOrder: i,
          delayHours: step.delayHours,
        })),
      );
    }
  }
}
