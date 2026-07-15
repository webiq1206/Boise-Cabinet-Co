import {
  ShieldCheck,
  MessageSquare,
  CalendarClock,
  Wallet,
  Hammer,
  HeartHandshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SITE_TAGLINE = "Idaho's premier custom cabinet company";

export const HERO_EYEBROW = "Treasure Valley Custom Cabinetry";

export const HERO_SUBHEAD =
  "Design, build, and install premium custom cabinets from first sketch to final walkthrough.";

export const HERO_STATS = [
  { num: "299", label: "Finish options" },
  { num: "Free", label: "Design consultation" },
  { num: "Lifetime", label: "Warranty" },
] as const;

export const DIFFERENTIATORS_HEADLINE = "Built for homeowners who want clarity, not chaos";

export const DIFFERENTIATORS_INTRO =
  "Many homeowners we meet have lived through a cabinet project where finishes shifted, timelines slipped, or nobody returned their calls. We built our process around the opposite: one accountable team, a written scope before fabrication, a job site that respects your home, and proactive updates through installation.";

export interface Differentiator {
  title: string;
  body: string;
  contrast: string;
}

/** Top differentiators for homepage; full list on About. */
export const HOMEPAGE_DIFFERENTIATOR_INDICES = [9, 0, 1, 2, 3] as const;

export const DIFFERENTIATORS: Differentiator[] = [
  {
    title: "One team, one point of accountability",
    contrast: "Instead of coordinating a designer, a contractor, and multiple subs who may point fingers when something goes wrong,",
    body: "you work with one cabinet team. Design, fabrication, and installation stay under one roof, with the same dedicated project manager from your first visit through final walkthrough.",
  },
  {
    title: "A written plan before we swing a hammer",
    contrast: "Rather than relying on a verbal estimate that shifts once work begins,",
    body: "you receive a clear written scope with design direction and finish selections before fabrication begins. Any change mid-project requires a written change order with your approval first.",
  },
  {
    title: "Proactive communication, not radio silence",
    contrast: "Instead of wondering what happened on your project this week,",
    body: "you receive a written update every Friday: what was completed, what is next, and any decisions needed from you. We also flag budget impacts early, before they become surprises.",
  },
  {
    title: "Local permit and schedule expertise",
    contrast: "Rather than chasing paperwork or guessing at timelines,",
    body: "we handle Ada and Canyon County permits in-house and build realistic schedules into your project plan from day one. You always know where the project stands.",
  },
  {
    title: "Confidence that outlasts the project",
    contrast: "Beyond a quick sign-off and goodbye,",
    body: "we stand behind our craftsmanship with a written workmanship guarantee. Optional 3D visualizations are available for clients who want extra confidence in major layout and finish decisions before construction begins.",
  },
  {
    title: "A job site that respects your home",
    contrast: "Instead of living with open dust, damaged floors, and crews working at all hours,",
    body: "we use floor protection daily, schedule installation during reasonable hours, and plan the project so most kitchen and bath cabinet work remains livable while we work.",
  },
  {
    title: "No high-pressure sales, no going dark",
    contrast: "Rather than a commission-driven pitch to sign on the spot or a project manager who stops returning calls,",
    body: "your free in-home visit is focused on planning guidance and an honest range. You work with the same dedicated project manager throughout, with weekly written updates so you are never left wondering who to contact or what is happening.",
  },
  {
    title: "Schedule changes communicated early",
    contrast: "Instead of finding out a milestone slipped after the fact,",
    body: "we build realistic timelines into your plan from day one and update you in writing when anything affects your schedule. Permit timelines for Ada and Canyon County are accounted for upfront, not treated as an afterthought.",
  },
  {
    title: "Craftsmanship you review before we close out",
    contrast: "Rather than rushing to the next job before you have a chance to inspect the work,",
    body: "we walk every finished detail with you at a final walkthrough. Finish selections are documented in your written scope before construction so what we build matches what you approved.",
  },
  {
    title: "Your budget builds your home, not our overhead",
    contrast: "Instead of paying for big offices, fancy showrooms, truck fleets, and layers of management that get built into your quote,",
    body: "you pay for your project. We keep overhead lean and put your money where it shows up in your home: skilled craftsmen, better materials, and workmanship we stand behind. Every dollar should go toward your cabinets, not our bills.",
  },
];

export const TRUST_ITEMS = [
  "Bonded · Insured",
  "Liability Coverage",
  "Built to Order",
  "Workmanship Guarantee",
];

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  /** True until the client confirms a real, named team member. */
  isPlaceholder: boolean;
}

/**
 * Founder + key team. E-E-A-T signal (named people with roles/experience).
 * TODO(client): replace placeholder names, roles, and bios with real team
 * members before launch. Set `isPlaceholder: false` once confirmed. Person
 * schema is emitted only for confirmed (non-placeholder) members.
 */
export const TEAM: TeamMember[] = [
  {
    name: "Founder & Owner",
    role: "Founder & Owner",
    bio: "Founded Boise Cabinet Co in 2017 to bring frameless, built-to-order cabinetry and clear, accountable project management to Treasure Valley homeowners.",
    isPlaceholder: true,
  },
  {
    name: "Lead Designer",
    role: "Lead Cabinet Designer",
    bio: "Guides homeowners through layout, door style, and finish selection, translating each kitchen, bath, and built-in into a buildable, written design.",
    isPlaceholder: true,
  },
  {
    name: "Installation Lead",
    role: "Installation Lead",
    bio: "Runs on-site installation across Ada and Canyon County with daily floor protection, careful fitting, and a final walkthrough on every project.",
    isPlaceholder: true,
  },
];

export const PROMISE_ITEMS = [
  {
    num: "01",
    title: "Clear budget guidance",
    body: "You receive honest planning ranges, written scope, and proactive updates so you always know where your project stands.",
  },
  {
    num: "02",
    title: "Proactive communication",
    body: "Every Friday: what was completed, what is next, and any decisions needed from you. One dedicated project manager start to finish.",
  },
  {
    num: "03",
    title: "Schedule you can plan around",
    body: "We build realistic timelines into your project from day one and update you when anything changes, before it becomes a surprise.",
  },
  {
    num: "04",
    title: "The workmanship guarantee",
    body: "We stand behind our craftsmanship with a written workmanship guarantee, long after the final walkthrough.",
  },
];

export interface ClientPriority {
  title: string;
  body: string;
  icon: LucideIcon;
}

export const CLIENT_PRIORITIES: ClientPriority[] = [
  {
    title: "Trust and credibility",
    body: "Licensed, bonded, and insured with permits handled in-house and a written scope before work begins.",
    icon: ShieldCheck,
  },
  {
    title: "Quality craftsmanship",
    body: "Skilled trades, careful finishes, and a final walkthrough on every project we build.",
    icon: Hammer,
  },
  {
    title: "Clear communication",
    body: "Weekly written updates and one project manager who knows your home from first visit to completion.",
    icon: MessageSquare,
  },
  {
    title: "Staying on budget",
    body: "Planning ranges upfront, written change orders before extra work, and proactive budget guidance throughout.",
    icon: Wallet,
  },
  {
    title: "Staying on schedule",
    body: "Realistic timelines built into your project plan with design, fabrication, and installation milestones you can follow.",
    icon: CalendarClock,
  },
  {
    title: "A stress-free process",
    body: "Floor protection and a team that respects your home while cabinet work is in progress.",
    icon: HeartHandshake,
  },
];

export const HOW_WE_BUILD_STEPS = [
  {
    number: "01",
    title: "Free design consultation",
    desc: "We walk your space, discuss goals, and explore collection and finish options. No obligation.",
  },
  {
    number: "02",
    title: "Design Studio & selections",
    desc: "Refine your layout, door style, finish, and hardware in our Design Studio with 3D preview.",
  },
  {
    number: "03",
    title: "Approval & deposit",
    desc: "Review your proposal in the client portal, sign your agreement, and secure production with a deposit.",
  },
  {
    number: "04",
    title: "Fabrication & quality check",
    desc: "Your cabinets are built to order with frameless Euro construction and inspected before shipping.",
  },
  {
    number: "05",
    title: "Delivery, install & warranty",
    desc: "Professional installation, final walkthrough, and lifetime warranty support through your portal.",
  },
];

export const PRINCIPLES = [
  {
    title: "Written scope before we build",
    desc: "Every project starts with a clear written scope so you know exactly what to expect before fabrication begins.",
  },
  {
    title: "Written change orders only",
    desc: "If scope changes mid-project, you get a written change order before any additional work begins. Always.",
  },
  {
    title: "Proactive budget guidance",
    desc: "We communicate early when selections or conditions may affect your budget. No surprises at invoice time.",
  },
  {
    title: "We respect your time",
    desc: "Noisy work during reasonable hours. Dust barriers every day. Your home stays as livable as possible.",
  },
  {
    title: "One PM, start to finish",
    desc: "Your project manager is the same person from design day to final walkthrough. You always know who to call.",
  },
  {
    title: "Workmanship guarantee",
    desc: "We stand behind what we build with a written workmanship guarantee, because we build things meant to last.",
  },
];

export const STANDARD_INCLUSIONS = [
  "All permits pulled in-house",
  "Dedicated project manager",
  "Weekly written progress updates",
  "Dust barriers and floor protection daily",
  "Written workmanship guarantee",
  "Manufacturer warranties passed through",
];

export const OPTIONAL_ENHANCEMENTS = {
  title: "3D renderings and visualizations",
  body: "Optional design upgrade that helps you visualize your finished space before construction begins. Adds to project investment and design timeline, but gives many clients confidence in major layout and finish decisions.",
  note: "Available on request during your design consultation.",
};

export const BUDGET_GUIDANCE_POINTS = [
  {
    title: "Planning ranges, not firm bids",
    body: "Our online estimator and in-home visit provide planning ranges based on project type, size, finish level, and market conditions. Your detailed project evaluation happens at consultation.",
  },
  {
    title: "Written scope before construction",
    body: "Before work begins, you receive a written scope outlining what is included, key finish selections, and your project investment. This is your roadmap, not a line-item materials list.",
  },
  {
    title: "Proactive budget updates",
    body: "If selections, site conditions, or scope changes affect your budget, we communicate early and in writing before proceeding.",
  },
  {
    title: "Change orders in writing",
    body: "Any scope change mid-project requires a written change order with your approval before additional work begins.",
  },
];

export const LEADERSHIP_COPY = {
  label: "Our commitment",
  headline: "Custom cabinets should feel clear, not chaotic.",
  paragraphs: [
    "Boise Cabinet Co was built on a simple belief: homeowners in the Treasure Valley deserve a cabinet partner who communicates clearly, designs thoughtfully, and treats their home with respect.",
    "We know how most firms are compared: separate designers and installers, vague scopes, inconsistent updates, and pressure to sign before you have real answers. Our process was designed around what comparison shoppers actually need.",
    "That means one accountable team, written scope before we build, weekly updates while we work, and a team that picks up the phone when you have a question.",
  ],
  closing: "That is not a marketing promise. Every detail and every decision is handled with intention.",
};

export const FINANCING_BULLETS = [
  "Terms from 12 to 144 months",
  "Soft credit check to view offers",
  "No prepayment penalties",
  "Same-day approval decisions",
  "Works alongside cash, check, or wire",
];

export const CONSULT_BULLETS = [
  "60–90 minute design consultation at your home",
  "Explore collections, finishes, and door styles",
  "Planning investment range on the spot",
  "No pressure. Clarity, not a sales pitch",
];
