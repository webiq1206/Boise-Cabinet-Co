import Link from "next/link";
import Image from "next/image";
import { getDoorStyleImages } from "@/shared/catalog";
import { ArrowRight, Check } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/marketing/Section";
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SplitSection } from "@/components/marketing/SplitSection";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateServiceSchema,
  generateFAQSchema,
} from "@/lib/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";

export const metadata = catalogMetadata(
  "/shaker-cabinets",
  "Shaker Cabinets",
  catalogDescription(
    "Custom shaker cabinets built to order by {company} in Meridian, Idaho. Four shaker profiles, 299 finishes including classic white shaker, sage green, and two-tone, with frameless construction.",
  ),
);

/** The four shaker profiles we build, each with its own detail page. */
const PROFILES = [
  {
    name: "Modern Shaker",
    slug: "modern-shaker",
    body: "The versatile all-rounder. A clean, square-frame shaker that suits nearly any home, traditional to modern.",
  },
  {
    name: "Thin Shaker",
    slug: "thin-shaker",
    body: "A narrower rail for a lighter, more transitional take on the classic shaker frame.",
  },
  {
    name: "Alpha Shaker",
    slug: "alpha-shaker",
    body: "A mitered shaker profile with a streamlined, contemporary edge.",
  },
  {
    name: "Beta Shaker",
    slug: "beta-shaker",
    body: "A traditional, craftsman-leaning shaker with a more pronounced frame.",
  },
];

const FAQS = [
  {
    question: "What are shaker cabinets?",
    answer:
      "Shaker cabinets have a five-piece door with a flat, recessed center panel set inside a simple square frame. The look is clean, timeless, and the most requested cabinet door style in America, which is why it works in almost any kitchen or bath.",
  },
  {
    question: "Are shaker cabinets still in style?",
    answer:
      "Yes. Shaker is the most enduring cabinet door style there is. Because the frame is simple and unadorned, it reads as current in a modern home and appropriate in a traditional one, so it rarely looks dated.",
  },
  {
    question: "What is the best color for shaker cabinets?",
    answer:
      "White is the timeless choice, and white shaker cabinets remain the most popular request. Sage green, greige, and two-tone shaker (a contrasting island or lowers) are all strongly on trend right now. We offer 299 finishes across matte, gloss, and woodgrain so you can match any look.",
  },
  {
    question: "Are your shaker cabinets custom?",
    answer:
      "Yes. Every shaker cabinet is built to order in our Meridian, Idaho shop and sized to your layout, with frameless (European) construction, dovetail drawers, and soft-close hardware standard.",
  },
  {
    question: "Are shaker cabinets framed or frameless?",
    answer:
      "Ours are frameless. Frameless (European) construction gives you more usable interior space and full-overlay doors for the clean, uninterrupted shaker look most homeowners want.",
  },
  {
    question: "How much do shaker cabinets cost?",
    answer:
      "Cost depends on the size of the project, finish level, and hardware. See our cabinet cost guide for Treasure Valley planning ranges, or request an estimate for a number specific to your project.",
  },
];

export default function ShakerCabinetsPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Shaker Cabinets",
      description:
        "Custom shaker cabinets in four profiles and 299 finishes, built to order by Boise Cabinet Co in Meridian, Idaho.",
      url: "/shaker-cabinets",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Shaker Cabinets", url: "/shaker-cabinets" },
    ]),
    generateServiceSchema(
      "Custom Shaker Cabinets",
      "Built-to-order shaker cabinetry in modern, thin, alpha, and beta profiles with frameless construction and 299 finishes, designed and installed across the Treasure Valley by Boise Cabinet Co.",
    ),
    generateFAQSchema(FAQS),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <CinematicHero
          image={"/images/marketing/hero-home.webp"}
          alt="Shaker-style kitchen design inspiration with white cabinets and a wood island"
          breadcrumbs={[{ name: "Home", href: "/" }, { name: "Shaker Cabinets" }]}
          eyebrow="Door styles"
          title={<>
                  Custom shaker <em className="brc-accent text-accent">cabinets</em>
                </>}
          description={"Shaker is the most requested cabinet door in America: a flat, recessed panel inside a clean square frame that looks right in any home. We build it to order in four profiles and 299 finishes, from classic white shaker to sage green and two-tone, in our Meridian, Idaho shop."}
        >
              <Button variant="brand" asChild>
                <Link href="/estimate">
                  Get an estimate <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href="/catalog">Browse finishes</Link>
              </Button>
        </CinematicHero>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow="Shaker profiles"
              title={
                <>
                  Four ways to do <em className="brc-accent text-accent">shaker</em>
                </>
              }
              className="mb-10"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              {PROFILES.map((p) => (
                <MarketingCard key={p.slug} className="h-full">
                  <div className="relative mb-5 aspect-[4/3] overflow-hidden bg-[#F7F3EC]">
                    <Image src={getDoorStyleImages(p.slug).primary} alt={`${p.name} door profile illustration`} fill sizes="(max-width: 640px) 90vw, 40vw" className="object-contain" />
                  </div>
                  <h2 className="ed-h3 mb-3">{p.name}</h2>
                  <p className="text-base leading-relaxed text-muted-foreground">{p.body}</p>
                </MarketingCard>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="brandOutline" asChild>
                <Link href="/catalog">
                  Compare all profiles <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Section>

        <Section divider>
          <SplitSection header={<SectionHeader
              eyebrow="Finishes"
              title={
                <>
                  White, sage, greige, or <em className="brc-accent text-accent">two-tone</em>
                </>
              }
              className="mb-0"
            />}>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
              White shaker cabinets are the timeless default, but shaker takes color beautifully.{" "}
              <Link href="/blog/sage-green-kitchen-cabinets" className="text-accent hover:underline">
                Sage green
              </Link>{" "}
              and greige are the most-requested colors right now, and a{" "}
              <Link href="/blog/two-tone-kitchen-cabinets" className="text-accent hover:underline">
                two-tone kitchen
              </Link>{" "}
              (a contrasting island or lower cabinets) is an easy way to add depth. Every profile is
              available across our 299 finishes in matte, gloss, and woodgrain.
            </p>
            <Button variant="brandOutline" asChild>
              <Link href="/catalog">
                Explore cabinet finishes <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </SplitSection>
        </Section>

        <Section variant="greige" divider>
          <SplitSection header={<SectionHeader eyebrow="Built to last" title={<>Why our shaker holds up</>} className="mb-0" />}>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                "Frameless construction for more interior space and a clean, full-overlay look",
                "Furniture-grade plywood boxes, not particle board",
                "Dovetail drawers and soft-close hardware standard",
                "Built to order and sized to your layout in Meridian, Idaho",
                "Installed by our own Treasure Valley crew",
                "Backed by a written workmanship guarantee",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm md:text-base text-muted-foreground">
                  <Check className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground mt-6">
              More on our{" "}
              <Link href="/construction" className="text-accent hover:underline">
                frameless cabinet construction
              </Link>
              .
            </p>
          </SplitSection>
        </Section>

        <Section divider>
          <SplitSection header={<SectionHeader eyebrow="Shaker FAQ" title={<>Common shaker questions</>} className="mb-0" />}>
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
                Ready to plan your <em className="brc-accent text-accent">shaker kitchen</em>?
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-inverse-foreground/85 mb-8">
                Tell us your layout and finish direction and we will put together a plan and an
                honest range, with no obligation.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto items-stretch sm:items-center sm:justify-center">
                <Button variant="brand" asChild>
                  <Link href="/estimate">
                    Get an estimate <ArrowRight className="h-4 w-4" />
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
