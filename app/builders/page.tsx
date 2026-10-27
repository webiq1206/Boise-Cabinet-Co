import { LandingContactActions } from "@/components/marketing/LandingContactActions";
import { KitchenCabinetsQuoteForm } from "@/components/marketing/KitchenCabinetsQuoteForm";
import { InteriorPage } from '@/components/approved/InteriorLayout';
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { PhotoBreak } from "@/components/marketing/PhotoBreak";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SplitSection } from "@/components/marketing/SplitSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { buildPageMetadata } from "@/lib/page-metadata";
import {
generateBreadcrumbSchema,
generateFAQSchema,
generateServiceSchema,
generateWebPageSchema,
} from "@/lib/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { ENRICHMENT_IMAGES } from "@/shared/siteImages";
import { ArrowRight,Check } from "lucide-react";
import Link from "next/link";

export const metadata = withBrandPageMetadata((buildPageMetadata({
  kind: "service",
  path: "/builders",
  titleOverride:
    "Builder & Contractor Cabinets | Volume Pricing",
  descriptionOverride:
    "Trade cabinet pricing, spec consistency across units, and lead times measured in weeks for Treasure Valley builders, GCs, and multi-family developers. Built to order in Meridian, Idaho.",
})), "/builders");

/** Why a builder or GC chooses us over a big shop or a national supplier. */
const REASONS = [
  {
    title: "Lead times that protect your schedule",
    body: "Timing depends on the cabinet line and project scope. Our team confirms availability and proposed production and installation dates for your project.",
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
    value: "Timing depends on the cabinet line and project scope; availability is confirmed by our team.",
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
    value: "Permit requirements and the issuing authority depend on the project scope and address. We confirm permit coordination in the project plan.",
  },
  {
    label: "Construction",
    value: "Cabinet box options, including frameless, sized to your plans, with a written workmanship guarantee.",
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
      "Lead times depend on the cabinet line and project scope. Our team confirms availability and proposed dates before work is scheduled.",
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
    <InteriorPage kind="builders"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col ">
        <CinematicHero
          image="/images/marketing/hero-construction.webp"
          alt="cabinet boxes being prepared in a woodworking shop"
          breadcrumbs={[{ name: "Home", href: "/" }, { name: "For Builders" }]}
          eyebrow="For builders & contractors"
          title={<>
                  Cabinetry that keeps your <em className="brc-accent text-accent">schedule</em>
                </>}
          description="Discuss your cabinet scope, project location and target schedule with Boise Cabinet Co. Start with a call, text or project request."
        >
          <LandingContactActions formId="builder-inquiry" formLabel="Send Project Details" />
        </CinematicHero>
        <section id="builder-inquiry" tabIndex={-1} className="mx-auto w-full max-w-3xl scroll-mt-28 px-6 py-8">
          <h2 className="text-2xl font-serif">Tell us about your cabinet project</h2>
          <p className="my-4">Include your company, project location and cabinet scope. Plans and unit counts are helpful when available. Requested dates are subject to review.</p>
          <KitchenCabinetsQuoteForm context="builder-contractor" projectPrompt="Company, location and cabinet scope" submitLabel="Send Builder Project Request" />
        </section>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow="Why builders work with us"
              title={
                <>
                  A supplier that makes your job <em className="brc-accent text-accent">easier</em>
                </>
              }
              className="mb-10"
            />
            <div className="grid md:grid-cols-2 gap-4">
              {REASONS.map((r) => (
                <MarketingCard key={r.title} className="h-full">
                  <h3 className="ed-h3 mb-3">{r.title}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">{r.body}</p>
                </MarketingCard>
              ))}
            </div>
          </div>
        </Section>

        <PhotoBreak
          src={ENRICHMENT_IMAGES.buildersStaging}
          alt="Cabinet boxes staged for delivery and installation for a Treasure Valley builder project"
          caption="Boxes staged and ready so install days stay on your schedule."
        />

        <Section divider>
          <SplitSection header={<SectionHeader
              eyebrow="The terms, up front"
              title={
                <>
                  No mystery pricing, no <em className="brc-accent text-accent">runaround</em>
                </>
              }
              className="mb-0"
            />}>
            <dl className="divide-y divide-border border-t border-border">
              {TERMS.map((t) => (
                <div key={t.label} className="grid sm:grid-cols-[160px_1fr] gap-1 sm:gap-6 py-5">
                  <dt className="text-sm uppercase tracking-[0.08em] text-foreground">{t.label}</dt>
                  <dd className="text-base leading-relaxed text-muted-foreground">{t.value}</dd>
                </div>
              ))}
            </dl>
          </SplitSection>
        </Section>

        <Section variant="greige" divider>
          <SplitSection header={<SectionHeader
              eyebrow="What we supply and install"
              title={<>Project types</>}
              className="mb-0"
            />}>
            <ul className="grid sm:grid-cols-2 gap-3">
              {PROJECT_TYPES.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm md:text-base text-muted-foreground">
                  <Check className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </SplitSection>
        </Section>

        <PhotoBreak
          src={ENRICHMENT_IMAGES.constructionDetail}
          alt="Frameless plywood cabinet box and dovetail drawer detail from Boise Cabinet Co"
          caption="One Meridian shop for design, fabrication, and install coordination."
        />

        <Section divider>
          <SplitSection header={<SectionHeader
              eyebrow="Builder FAQ"
              title={<>Questions we hear from contractors</>}
              className="mb-0"
            />}>
            <div className="divide-y divide-border border-t border-border">
              {FAQS.map((f) => (
                <div key={f.question} className="py-6">
                  <h3 className="ed-h4 mb-2">{f.question}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">{f.answer}</p>
                </div>
              ))}
            </div>
          </SplitSection>
        </Section>

        <Section variant="inverse" divider>
          <div className="ed-shell">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="ed-h2 ed-statement-wide">
                Send us the project. We will send back a{" "}
                <em className="brc-accent text-accent">number</em>.
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-inverse-foreground/85 mb-8">
                Plans, a unit count, or just a rough scope is enough to start. We will talk timeline,
                pricing, and specs, and give you a lead time you can build around.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto items-stretch sm:items-center sm:justify-center">
                <Button variant="brand" asChild>
                  <Link href="#builder-inquiry">
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
    </></InteriorPage>
  );
}
