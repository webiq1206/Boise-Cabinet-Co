import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateServiceSchema,
  generateFAQSchema,
} from "@/lib/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";

export const metadata = buildPageMetadata({
  kind: "service",
  path: "/builders",
  titleOverride:
    "For Builders & Contractors | Volume Cabinet Pricing & Fast Lead Times",
  descriptionOverride:
    "Trade cabinet pricing, spec consistency across units, and lead times measured in weeks for Treasure Valley builders, GCs, and multi-family developers. Built to order in Meridian, Idaho.",
});

/** Why a builder or GC chooses us over a big shop or a national supplier. */
const REASONS = [
  {
    title: "Lead times that protect your schedule",
    body: "Our cabinets are historically ready in just a couple of weeks, typically far shorter than the larger shops. We confirm your production and install dates in writing so you can sequence the other trades around a date you trust.",
  },
  {
    title: "Volume pricing, scaled to the project",
    body: "Multi-family, apartment, and condo builds earn quantity discounts. Single-home trade pricing is set by the relationship and scope. Either way, you are not paying a retail markup for a showroom you will never use.",
  },
  {
    title: "Spec consistency across every unit",
    body: "We build to one approved finish schedule and one set of shop drawings, so cabinetry matches from the first unit to the last. Reorders and later phases stay consistent.",
  },
  {
    title: "One local shop, one point of contact",
    body: "Design, fabrication, and installation run out of our Meridian shop under a single project contact. No cross-country freight, no backorder roulette, and no finger-pointing between vendors.",
  },
];

/** The commercial terms builders ask about, stated plainly. */
const TERMS = [
  {
    label: "Lead time",
    value: "Historically a couple of weeks; confirmed in writing per project before we start.",
  },
  {
    label: "Pricing",
    value: "Volume discounts on multi-family, apartments, and condos. Single-home trade pricing by relationship and scope.",
  },
  {
    label: "Payment",
    value: "50% deposit to reserve production, 50% after installation. No drawn-out draw schedules.",
  },
  {
    label: "Permits",
    value: "Ada and Canyon County cabinet permits pulled in-house when your project requires them.",
  },
  {
    label: "Construction",
    value: "Frameless, furniture-grade boxes built to order, with a written workmanship guarantee.",
  },
  {
    label: "Install",
    value: "Delivered and installed by our own Treasure Valley crew, coordinated to your jobsite schedule.",
  },
];

const PROJECT_TYPES = [
  "Custom & spec homes",
  "Remodels & flips",
  "Multi-family",
  "Apartments",
  "Condos",
  "ADUs & additions",
  "Tenant improvements",
  "Model & short-term rentals",
];

const FAQS = [
  {
    question: "Do you offer builder or trade pricing?",
    answer:
      "Yes. We offer volume discounts on larger projects like multi-family, apartments, and condos, and trade pricing on single homes based on the relationship and scope. Send us the project and we will put a number together.",
  },
  {
    question: "What are your payment terms for builders?",
    answer:
      "A 50% deposit reserves your spot in production, and the remaining 50% is due after installation.",
  },
  {
    question: "How fast can you turn a project?",
    answer:
      "Lead times vary by size, but our cabinets are historically ready in just a couple of weeks, typically far shorter than the larger shops. We confirm your dates in writing before we start.",
  },
  {
    question: "Can you keep specs consistent across many units?",
    answer:
      "Yes. We build to one approved finish schedule and one set of shop drawings, so every unit matches, including reorders and later phases.",
  },
  {
    question: "Do you handle multi-family and apartment projects?",
    answer:
      "Yes. Volume builds are a core part of what we do, and quantity pricing applies to multi-family, apartment, and condo work.",
  },
  {
    question: "Do you deliver and install, or just supply the cabinets?",
    answer:
      "We build to order in our Meridian shop, then deliver and install with our own Treasure Valley crew, coordinated to your jobsite schedule.",
  },
];

export default function BuildersPage() {
  const schemas = [
    generateWebPageSchema({
      title: "For Builders & Contractors",
      description:
        "Volume cabinet pricing, fast lead times, and spec consistency for Treasure Valley builders and developers.",
      url: "/builders",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "For Builders", url: "/builders" },
    ]),
    generateServiceSchema(
      "Builder & Trade Cabinetry Program",
      "Volume-priced custom cabinetry for builders, general contractors, and multi-family developers across the Treasure Valley, built to order in Meridian, Idaho with fast lead times and consistent specs across units.",
    ),
    generateFAQSchema(FAQS),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "For Builders" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="For builders & contractors"
              title={
                <>
                  Cabinetry that keeps your <em className="brc-accent text-accent">schedule</em>
                </>
              }
              description="Built to order in Meridian and installed by our own crew, with volume pricing, consistent specs across units, and lead times measured in weeks, not months. When your money goes to the work instead of a supplier's overhead, you get a number you can build a bid on."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="brand" asChild>
                <Link href="/contact">
                  Request builder pricing <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <a href={SITE_CONFIG.phoneHref}>Call {SITE_CONFIG.phone}</a>
              </Button>
            </div>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <SectionHeader
              align="center"
              eyebrow="Why builders work with us"
              title={
                <>
                  A supplier that makes your job <em className="brc-accent text-accent">easier</em>
                </>
              }
              className="mb-10 max-w-2xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {REASONS.map((r) => (
                <MarketingCard key={r.title} className="h-full">
                  <h3 className="font-sans font-light text-xl text-foreground mb-2">{r.title}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">{r.body}</p>
                </MarketingCard>
              ))}
            </div>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="The terms, up front"
              title={
                <>
                  No mystery pricing, no <em className="brc-accent text-accent">runaround</em>
                </>
              }
              className="mb-8"
            />
            <dl className="divide-y divide-border border-t border-border">
              {TERMS.map((t) => (
                <div key={t.label} className="grid sm:grid-cols-[160px_1fr] gap-1 sm:gap-6 py-5">
                  <dt className="text-sm uppercase tracking-[0.08em] text-foreground">{t.label}</dt>
                  <dd className="text-base leading-relaxed text-muted-foreground">{t.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="What we build"
              title={<>Project types</>}
              className="mb-8"
            />
            <ul className="grid sm:grid-cols-2 gap-3">
              {PROJECT_TYPES.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm md:text-base text-muted-foreground">
                  <Check className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Builder FAQ"
              title={<>Questions we hear from contractors</>}
              className="mb-8"
            />
            <div className="divide-y divide-border border-t border-border">
              {FAQS.map((f) => (
                <div key={f.question} className="py-6">
                  <h3 className="font-sans font-light text-lg text-foreground mb-2">{f.question}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section variant="inverse" divider>
          <div className="container px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-sans font-light text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-tight text-inverse-foreground mb-4">
                Send us the project. We will send back a{" "}
                <em className="brc-accent text-accent">number</em>.
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-inverse-foreground/85 mb-8">
                Plans, a unit count, or just a rough scope is enough to start. We will talk timeline,
                pricing, and specs, and give you a lead time you can build around.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="brand" asChild>
                  <Link href="/contact">
                    Request builder pricing <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="brandOutline"
                  className="border-inverse-foreground/25 bg-inverse-foreground/10 text-inverse-foreground hover:bg-inverse-foreground/15"
                  asChild
                >
                  <a href={SITE_CONFIG.phoneHref}>Call {SITE_CONFIG.phone}</a>
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
