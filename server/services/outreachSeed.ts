import { db } from "@/lib/db";
import { emailTemplates, sequences, sequenceSteps } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { SITE_CONFIG } from "@/shared/siteConfig";

// Seeds managed email templates and the on-brand sequences. Idempotent:
// templates are refreshed only while seedManaged stays true (an operator edit
// flips it off and is never overwritten); seeded sequences are created once and
// thereafter only have their light metadata (name, description, audience)
// refreshed, while their steps are always left untouched. No em dashes anywhere
// in this copy (house style).

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
    subject: "Cabinets for your next project",
    openingLine: "I run a custom cabinet shop here in Boise, and I'd love the chance to work with you.",
    mainMessage:
      "Quick background on me. I ran a remodeling company in Colorado for years before we moved the family out to Boise, where I started Boise Cabinet Co. We build custom cabinets to order, kitchens, vanities, and built-ins, for all kinds of projects and spaces.\n\nWhat that means for you is fair pricing, lead times that fit your schedule, and someone who actually picks up the phone when you call. I attached our catalog so you can see the door styles and finishes we work with.",
    closingLine: "If you've got something coming up, I'd be glad to put a number together. Open to a quick call?",
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
    subject: "Any projects coming up, {business}?",
    openingLine: "Just following up on my note from last week.",
    mainMessage:
      "Keeping it simple: you get fair pricing, short lead times, and one person to deal with from the first sketch to the final install.\n\nWe build for the Treasure Valley and work around your schedule, so the cabinets are never what holds up a project.",
    closingLine: "Happy to quote your next kitchen, bath, or built-in whenever the timing's right. Just hit reply.",
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
    subject: "A cabinet partner for {business}",
    openingLine: "Wanted to introduce my shop, Boise Cabinet Co, in case {business} ever needs a cabinet partner.",
    mainMessage:
      "We build custom cabinets to order for homes and businesses across the Treasure Valley. Clear written scopes, fair pricing, and one person who owns the project from the first sketch to the final install.\n\nThe people we work with stick with us because we keep our pricing fair, hit our lead times, and treat their space like our own.",
    closingLine: "Worth a quick call this week?",
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
    openingLine: "I wanted to reach out and say hello, and introduce my cabinet shop here in the valley.",
    mainMessage:
      "I'm Nick. I ran a remodeling business in Colorado for years, then moved the family to Boise and opened Boise Cabinet Co. We build custom cabinets right here in the valley for anyone who'd rather hand the cabinet part of a project to a shop they trust than deal with it themselves.\n\nYou can expect fair pricing, short lead times, and a crew that actually cares how the work turns out. I attached our catalog so you can get a feel for our door styles and finishes.",
    closingLine: "If a kitchen, bath, or built-in comes up, I'd love a shot at quoting it. No pressure either way.",
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
    subject: "Following up on cabinets for {business}",
    openingLine: "Following up in case you've got a project on the horizon.",
    mainMessage:
      "Easiest way to see if we're a fit is to let me price something real. Send me a plan, or even a rough idea, and I'll get a clear quote back to you fast.\n\nYou focus on the rest of the project and let me handle the cabinets.",
    closingLine: "Anything coming up you'd want me to look at?",
    ctaLabel: "Get a bid",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-intro-3",
    name: "Contractor Intro: Keeping in touch",
    audience: "business",
    subject: "Still here whenever you need cabinets",
    openingLine: "I'll keep this one short.",
    mainMessage:
      "If cabinets aren't on your plate right now, no worries at all. When the time comes, there's a local shop here with fair pricing, short lead times, and a crew that's easy to deal with. I'd be glad to be your cabinet guy.",
    closingLine: "Reply any time and I'll be ready to help.",
    ctaLabel: "Visit our site",
    ctaUrl: SITE,
    signerName: OWNER_SIGNER,
  },

  // 8. Contractor Value (business) - direct and brief, value first.
  {
    id: "contractor-value-1",
    name: "Contractor Value: Quick intro",
    audience: "business",
    subject: "Quick hello from a Boise cabinet shop",
    openingLine: "Quick hello from a cabinet shop here in Boise.",
    mainMessage:
      "I'm Nick with Boise Cabinet Co. After years running a remodeling business in Colorado, I moved the family to Boise and opened a custom cabinet shop here.\n\nFor the people we work with, it comes down to three things: fair pricing, short lead times, and service that makes your project easier. I attached our catalog so you can see the range.",
    closingLine: "Got a kitchen, bath, or built-in coming up? I'll quote it.",
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
    subject: "Why people send us their cabinet work",
    openingLine: "A quick rundown of why people hand us their cabinet work.",
    mainMessage:
      "Fair pricing that protects your budget.\n\nShort lead times that fit your schedule.\n\nService that keeps the project moving and everyone happy.\n\nThat's what we do, every time.",
    closingLine: "Send me your next set of plans and I'll price them.",
    ctaLabel: "Send us a project",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-value-3",
    name: "Contractor Value: Last note",
    audience: "business",
    subject: "Last note for now",
    openingLine: "I don't want to clutter your inbox, so this is my last note for now.",
    mainMessage:
      "If you ever need a solid cabinet shop with fair pricing and quick turnaround, I'm here. One email and I'll get a quote back to you.",
    closingLine: "Thanks for reading, and good luck with your projects.",
    ctaLabel: "Reach out",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },

  // 9. Contractor Story (business) - relationship led, four emails.
  {
    id: "contractor-story-1",
    name: "Contractor Story: Colorado to Boise",
    audience: "business",
    subject: "From Colorado to Boise",
    openingLine: "Figured I'd take a minute to introduce myself and my shop.",
    mainMessage:
      "I spent years running a remodeling business in Colorado. When we moved the family to Boise, I opened Boise Cabinet Co so I could focus on the part I love most, building cabinets.\n\nBecause I've spent years in remodeling myself, I try to make this easy on you: fair pricing, short lead times, and real service when you need it. I attached our catalog so you can see what we build.",
    closingLine: "If you've got a project where cabinets would help, I'd be glad to quote it.",
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
    subject: "How we treat your project",
    openingLine: "One thing I care about more than most is service.",
    mainMessage:
      "When you hand off the cabinets, you're trusting us with your project and your name, and we don't take that lightly.\n\nThat means clear communication, work finished on time, and cabinets you'll be proud of. It's a big part of why people stick with us.",
    closingLine: "Happy to show you what that looks like on a real project.",
    ctaLabel: "Start a conversation",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-story-3",
    name: "Contractor Story: Pricing and timing",
    audience: "business",
    subject: "Pricing and timing, the short version",
    openingLine: "A quick word on the two things that usually matter most.",
    mainMessage:
      "Pricing: ours stays fair and competitive, so your budget stays strong.\n\nTiming: we keep lead times short and plan around your schedule, so cabinets never turn into the holdup on a project.",
    closingLine: "Send me something to price and I'll show you both.",
    ctaLabel: "Get a bid",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },
  {
    id: "contractor-story-4",
    name: "Contractor Story: Whenever you are ready",
    audience: "business",
    subject: "Whenever you're ready, {business}",
    openingLine: "I'll leave the ball in your court from here.",
    mainMessage:
      "If you ever want a cabinet shop that offers fair pricing, quick turnaround, and service you can count on, I'd love to earn your business. Just reply and I'll take it from there.",
    closingLine: "Thanks for your time, and I hope we get to work together down the road.",
    ctaLabel: "Visit our site",
    ctaUrl: SITE,
    signerName: OWNER_SIGNER,
  },

  // 10. Local Business Outreach (business) - generic, not builder specific, for
  // companies other than contractors. Warm, low pressure, earns their business.
  {
    id: "business-general-1",
    name: "Local Business Intro: Hello",
    audience: "business",
    subject: "Custom cabinets for {business}",
    openingLine: "I wanted to introduce myself and my cabinet shop here in Boise.",
    mainMessage:
      "I'm Nick with Boise Cabinet Co. After years running a remodeling business in Colorado, my family moved to Boise and I opened a custom cabinet shop here. We build cabinets to order, kitchens, vanities, offices, built-ins, and just about any space that needs them.\n\nWhatever the project, you can expect fair pricing, short lead times, and someone who actually picks up the phone. I attached our catalog so you can get a feel for our door styles and finishes.",
    closingLine: "If custom cabinets would ever help on a project, I'd love the opportunity to earn your business.",
    ctaLabel: "See our work",
    ctaUrl: `${SITE}/collections`,
    secondaryCtaLabel: "View our catalog",
    secondaryCtaUrl: CATALOG_URL,
    attachmentKey: "catalog",
    signerName: OWNER_SIGNER,
  },
  {
    id: "business-general-2",
    name: "Local Business Intro: Following up",
    audience: "business",
    subject: "Following up with {business}",
    openingLine: "Just following up on my note from last week.",
    mainMessage:
      "No pressure at all. If you ever need custom cabinets, whether it's a remodel, a rental, an office, or any other space, I'd be glad to help.\n\nThe easiest way to see if we're a good fit is to let me price something real. Send over the details and I'll get a clear quote back to you fast.",
    closingLine: "I'd love the chance to work with you whenever the timing is right.",
    ctaLabel: "Start a conversation",
    ctaUrl: `${SITE}/consultation`,
    signerName: OWNER_SIGNER,
  },
  {
    id: "business-general-3",
    name: "Local Business Intro: Last note",
    audience: "business",
    subject: "Last note for now",
    openingLine: "I'll keep this short and leave the ball in your court.",
    mainMessage:
      "If custom cabinets aren't on your list right now, no worries at all. When the time comes, there's a local shop here with fair pricing, quick turnaround, and service you can count on. I'd love the opportunity to earn your business and work with you.",
    closingLine: "Reply any time and I'll be ready to help.",
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
    description: "Introduce Boise Cabinet Co to local businesses. Business audience.",
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
      "Personal note from Nick to local businesses. First email attaches the catalog. Business audience.",
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
      "Short, value first pitch to local businesses. First email attaches the catalog. Business audience.",
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
  {
    seedKey: "business-general",
    name: "Local Business Outreach",
    description:
      "Generic intro for any local business, not builder specific. First email attaches the catalog. Business only.",
    audience: "business",
    steps: [
      { templateId: "business-general-1", delayHours: 0 },
      { templateId: "business-general-2", delayHours: 72 },
      { templateId: "business-general-3", delayHours: 168 },
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

  // Sequences: create once per seedKey. On later runs, refresh only the light
  // metadata (name, description, audience) so seeded copy fixes propagate to
  // dev and prod, while an operator's step edits are always left untouched.
  for (const s of SEQUENCES) {
    const [existing] = await db.select().from(sequences).where(eq(sequences.seedKey, s.seedKey)).limit(1);
    if (existing) {
      await db
        .update(sequences)
        .set({ name: s.name, description: s.description, audience: s.audience })
        .where(eq(sequences.id, existing.id));
      continue;
    }
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
