import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
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
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Shaker Cabinets" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Door styles"
              title={
                <>
                  Custom shaker <em className="brc-accent text-accent">cabinets</em>
                </>
              }
              description="Shaker is the most requested cabinet door in America: a flat, recessed panel inside a clean square frame that looks right in any home. We build it to order in four profiles and 299 finishes, from classic white shaker to sage green and two-tone, in our Meridian, Idaho shop."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="brand" asChild>
                <Link href="/estimate">
                  Get an estimate <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href="/catalog">Browse finishes</Link>
              </Button>
            </div>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <SectionHeader
              align="center"
              eyebrow="Shaker profiles"
              title={
                <>
                  Four ways to do <em className="brc-accent text-accent">shaker</em>
                </>
              }
              className="mb-10 max-w-2xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {PROFILES.map((p) => (
                <MarketingCard key={p.slug} className="h-full">
                  <h2 className="font-sans font-light text-xl text-foreground mb-2">{p.name}</h2>
                  <p className="text-sm md:text-base leading-relaxed text-muted-foreground">{p.body}</p>
                </MarketingCard>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="brandOutline" asChild>
                <Link href="/catalog">
                  Compare every profile in the catalog <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Finishes"
              title={
                <>
                  White, sage, greige, or <em className="brc-accent text-accent">two-tone</em>
                </>
              }
              className="mb-6"
            />
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
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader eyebrow="Built to last" title={<>Why our shaker holds up</>} className="mb-8" />
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
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader eyebrow="Shaker FAQ" title={<>Common shaker questions</>} className="mb-8" />
            <div className="divide-y divide-border border-t border-border">
              {FAQS.map((f) => (
                <div key={f.question} className="py-6">
                  <h3 className="font-sans font-light text-lg text-foreground mb-2">{f.question}</h3>
                  <p className="text-sm md:text-base leading-relaxed text-muted-foreground">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section variant="inverse" divider>
          <div className="container px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-sans font-light text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-tight text-inverse-foreground mb-4">
                Ready to plan your <em className="brc-accent text-accent">shaker kitchen</em>?
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-inverse-foreground/85 mb-8">
                Tell us your layout and finish direction and we will put together a plan and an
                honest range, with no obligation.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
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
