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
// Contractor outreach is personal, so it signs as Nick (the owner) rather than
// the generic team line used for homeowner automation.
const OWNER_SIGNER = SITE_CONFIG.owner.name;
// The full product catalog, linked in every contractor first email and also
// attached to it (see attachmentKey "catalog").
const CATALOG_URL = `${SITE}/downloads/boise-cabinet-catalog.pdf`;

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
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  // Optional named attachment (e.g. "catalog"). Resolved to a file at send time.
  attachmentKey?: string;
  // Overrides the default signer line for this template.
  signerName?: string;
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
    openingLine: "I came across {business} while looking at builders doing quality work in {serviceArea}, and wanted to introduce myself.",
    mainMessage:
      "I ran a remodeling business in Colorado for years before my family moved out to Boise, where I opened Boise Cabinet Co. We build custom cabinets to order for kitchens, vanities, and built ins, and we work well as the cabinet partner on remodels and new builds.\n\nThree things our builder partners count on: competitive pricing that keeps your bids strong, short lead times so we fit your schedule, and customer service we take real pride in. I attached our full catalog so you can see our door styles and finishes.",
    closingLine: "If you have a project coming up, I would be glad to put together a bid. Open to a quick call?",
    ctaLabel: "See our work",
    ctaUrl: `${SITE}/collections`,
    secondaryCtaLabel: "View our catalog",
    secondaryCtaUrl: CATALOG_URL,
    attachmentKey: "catalog",
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-partnership-2",
    name: "Contractor Partnership: Follow Up",
    audience: "business",
    subject: "Following up: cabinets for {business}",
    openingLine: "Following up on my note about handling the cabinets for {business}.",
    mainMessage:
      "Keeping it simple: we give you competitive pricing, short lead times, and a single point of contact from first sketch to final install. We build for the Treasure Valley and plan around your schedule, so the cabinet part of a job never holds you up.",
    closingLine: "Happy to bid on your next kitchen, bath, or built in whenever the timing is right. Just reply here.",
    ctaLabel: "Start a conversation",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
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
      "We build custom cabinets to order for builders and remodelers across the Treasure Valley, with clear written scopes and one accountable contact from first sketch to final install. Builders partner with us for competitive pricing, short lead times, and customer service we take real pride in.",
    closingLine: "Would a short call this week be worthwhile?",
    ctaLabel: "See examples",
    ctaUrl: `${SITE}/collections`,
    signerName: OWNER_SIGNER,
  },

  // 7. Contractor Intro (business) - warm, personal, three follow ups.
  {
    id: "contractor-intro-1",
    name: "Contractor Intro: Hello",
    audience: "business",
    subject: "A local cabinet shop for {business}",
    openingLine: "I came across {business} in {serviceArea} and wanted to reach out.",
    mainMessage:
      "My name is Nick. I ran a remodeling business in Colorado for years, then moved my family out to Boise and opened Boise Cabinet Co. We build custom cabinets right here in the valley for contractors who would rather hand off the cabinet part of a job than manage it in house.\n\nWhat you can expect from us is competitive pricing, short lead times, and customer service we genuinely care about. I attached our full catalog so you can get a feel for our door styles and finishes.",
    closingLine: "If a kitchen, bath, or built in comes up, I would love the chance to bid it. No pressure at all.",
    ctaLabel: "See our cabinets",
    ctaUrl: `${SITE}/collections`,
    secondaryCtaLabel: "View our catalog",
    secondaryCtaUrl: CATALOG_URL,
    attachmentKey: "catalog",
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-intro-2",
    name: "Contractor Intro: Happy to bid",
    audience: "business",
    subject: "Happy to bid your next job, {business}",
    openingLine: "Just following up in case a project is on your radar.",
    mainMessage:
      "The easiest way to see if we are a fit is to let me price something real. Send me a plan or even a rough idea and I will put together a clear, competitive bid quickly. You stay focused on the rest of the build and the cabinets are handled.",
    closingLine: "Want me to take a look at anything you have coming up?",
    ctaLabel: "Get a bid",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-intro-3",
    name: "Contractor Intro: Keeping in touch",
    audience: "business",
    subject: "Keeping {business} in mind",
    openingLine: "I will keep this short.",
    mainMessage:
      "If cabinets are not on your plate right now, no worries. When the time comes, remember we offer competitive pricing, short lead times, and a team that is easy to work with. I would be glad to be your cabinet shop.",
    closingLine: "Reply any time and I will be ready to help.",
    ctaLabel: "Visit our site",
    ctaUrl: SITE,
    signerName: OWNER_SIGNER,
  },

  // 8. Contractor Value (business) - direct and brief, value first.
  {
    id: "contractor-value-1",
    name: "Contractor Value: Quick intro",
    audience: "business",
    subject: "Cabinets, done right, for {business}",
    openingLine: "Quick introduction from one local business to another.",
    mainMessage:
      "I am Nick with Boise Cabinet Co. After years running a remodeling business in Colorado, I moved my family to Boise and opened a custom cabinet shop here. For contractors that means three things: competitive pricing, short lead times, and service that makes your life easier. Our full catalog is attached so you can see the range.",
    closingLine: "Got a kitchen, bath, or built in coming up? I will bid it.",
    ctaLabel: "Browse the catalog",
    ctaUrl: `${SITE}/collections`,
    secondaryCtaLabel: "View our catalog",
    secondaryCtaUrl: CATALOG_URL,
    attachmentKey: "catalog",
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-value-2",
    name: "Contractor Value: Three reasons",
    audience: "business",
    subject: "Three reasons to send {business} cabinets our way",
    openingLine: "A quick recap of why contractors work with us.",
    mainMessage:
      "Competitive pricing that protects your margin. Short lead times that fit your schedule. Customer service that keeps the job moving and keeps your clients happy. That is what we do, every time.",
    closingLine: "Send me your next set of plans and I will price it.",
    ctaLabel: "Send us a project",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-value-3",
    name: "Contractor Value: Last note",
    audience: "business",
    subject: "Last note for now, {business}",
    openingLine: "I do not want to crowd your inbox, so this is my last note for now.",
    mainMessage:
      "If you ever need a reliable cabinet shop with fair pricing and quick turnaround, I am here. One email and I will get you a bid.",
    closingLine: "Thanks for reading, and good luck with the builds.",
    ctaLabel: "Reach out",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },

  // 9. Contractor Story (business) - relationship led, four emails.
  {
    id: "contractor-story-1",
    name: "Contractor Story: Colorado to Boise",
    audience: "business",
    subject: "From Colorado to Boise, and why I am writing {business}",
    openingLine: "I wanted to introduce myself and my shop to {business}.",
    mainMessage:
      "I spent years running a remodeling business in Colorado. When my family moved out to Boise, I opened Boise Cabinet Co so I could focus on the part of the work I love most, building great cabinets. I know the contractor side too, which is why I try to make this easy on you: competitive pricing, short lead times, and real customer service. I attached our catalog so you can see what we build.",
    closingLine: "If you have a project where cabinets would help, I would be glad to bid it.",
    ctaLabel: "See our work",
    ctaUrl: `${SITE}/collections`,
    secondaryCtaLabel: "View our catalog",
    secondaryCtaUrl: CATALOG_URL,
    attachmentKey: "catalog",
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-story-2",
    name: "Contractor Story: Service",
    audience: "business",
    subject: "How we treat your clients, {business}",
    openingLine: "One thing I care a lot about is service.",
    mainMessage:
      "When you hand off cabinets, you are trusting us with your client and your reputation. We take that seriously. Clear communication, on time work, and cabinets your clients will be proud of. That is the customer service side of what we do, and it is a big part of why builders stick with us.",
    closingLine: "Happy to show you what that looks like on a real project.",
    ctaLabel: "Start a conversation",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-story-3",
    name: "Contractor Story: Pricing and timing",
    audience: "business",
    subject: "Pricing and timing for {business}",
    openingLine: "A quick word on the two things that usually matter most.",
    mainMessage:
      "Pricing: ours is about as competitive as you will find in the valley, so your bids stay strong. Timing: we keep lead times short and plan around your schedule, so cabinets never become the holdup on a job.",
    closingLine: "Send me something to price and I will show you both.",
    ctaLabel: "Get a bid",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-story-4",
    name: "Contractor Story: Whenever you are ready",
    audience: "business",
    subject: "Whenever you are ready, {business}",
    openingLine: "I will leave the ball in your court from here.",
    mainMessage:
      "If you ever want a cabinet partner who offers fair pricing, quick turnaround, and service you can count on, I would love to earn your business. Just reply and I will take it from there.",
    closingLine: "Thanks for your time, and I hope we get to work together.",
    ctaLabel: "Visit our site",
    ctaUrl: SITE,
    signerName: OWNER_SIGNER,
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
  {
    seedKey: "contractor-intro",
    name: "Contractor Intro (warm)",
    description:
      "Personal note from Nick to local builders. First email attaches the catalog. Business only.",
    audience: "business",
    steps: [
      { templateId: "contractor-intro-1", delayHours: 0 },
      { templateId: "contractor-intro-2", delayHours: 72 },
      { templateId: "contractor-intro-3", delayHours: 168 },
    ],
  },
  {
    seedKey: "contractor-value",
    name: "Contractor Value (direct)",
    description:
      "Short, value first pitch to builders. First email attaches the catalog. Business only.",
    audience: "business",
    steps: [
      { templateId: "contractor-value-1", delayHours: 0 },
      { templateId: "contractor-value-2", delayHours: 96 },
      { templateId: "contractor-value-3", delayHours: 192 },
    ],
  },
  {
    seedKey: "contractor-story",
    name: "Contractor Story (relationship)",
    description:
      "Story led sequence about Nick's move to Boise and how he works. First email attaches the catalog. Business only.",
    audience: "business",
    steps: [
      { templateId: "contractor-story-1", delayHours: 0 },
      { templateId: "contractor-story-2", delayHours: 72 },
      { templateId: "contractor-story-3", delayHours: 144 },
      { templateId: "contractor-story-4", delayHours: 240 },
    ],
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
        signerName: t.signerName ?? SIGNER,
        ctaLabel: t.ctaLabel ?? null,
        ctaUrl: t.ctaUrl ?? null,
        secondaryCtaLabel: t.secondaryCtaLabel ?? null,
        secondaryCtaUrl: t.secondaryCtaUrl ?? null,
        attachmentKey: t.attachmentKey ?? null,
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
          signerName: t.signerName ?? SIGNER,
          ctaLabel: t.ctaLabel ?? null,
          ctaUrl: t.ctaUrl ?? null,
          secondaryCtaLabel: t.secondaryCtaLabel ?? null,
          secondaryCtaUrl: t.secondaryCtaUrl ?? null,
          attachmentKey: t.attachmentKey ?? null,
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
