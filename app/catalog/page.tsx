import { InteriorPage } from '@/components/approved/InteriorLayout';
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CatalogPreview } from "@/components/catalog/CatalogPreview";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { PageHeader } from "@/components/marketing/PageHeader";
import { ShortCopy } from "@/components/marketing/ShortCopy";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Section } from "@/components/marketing/Section";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { catalogDescription,catalogMetadata } from "@/lib/catalog-metadata";
import { buildCanonical } from "@/lib/page-metadata";
import { generateBreadcrumbSchema,generateFAQSchema,generateWebPageSchema } from "@/lib/schema";
import {
ACCESSORY_FAMILIES,
CABINET_PRODUCTS,
DOOR_STYLES,
FINISHES,
HARDWARE_OPTIONS,
} from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { Download } from "lucide-react";

export const metadata = withBrandPageMetadata({
  ...catalogMetadata(
  "/catalog",
  "Full Cabinet Catalog",
  catalogDescription(
    `Browse the complete {company} catalog online: ${DOOR_STYLES.length} door styles, ${FINISHES.length} finishes, ${CABINET_PRODUCTS.length} cabinet configurations, hardware, and accessories. Flip through the interactive catalog right on the page - no download required.`,
  ),
  {
    // First page of the catalog, cropped to OG dimensions. JPEG on purpose:
    // iMessage and some crawlers don't render WebP link previews.
    ogImage: {
      url: "/images/marketing/og-catalog-kitchen.jpg",
      width: 1200,
      height: 630,
      alt: "Warm kitchen with white oak cabinets, a walnut island and a vaulted wood ceiling",
    },
  },
),
  // Explicit self canonical in the page file, so a change to the metadata
  // wrapper can never silently drop it.
  alternates: { canonical: buildCanonical("/catalog") },
}, "/catalog");

const CATALOG_PDF_PATH = "/downloads/boise-cabinet-catalog.pdf";

/**
 * Server-rendered catalog summary. The flip-book above is client-rendered, so
 * without this block crawlers and answer engines saw about 150 words and no
 * door style, finish or hardware name on the page that receives every legacy
 * /finishes, /door-styles, /hardware and /collections redirect. Every figure
 * here is computed from the catalog data, so it cannot drift from the book.
 */
const FINISH_FAMILIES = [
  { id: "matte", label: "Matte" },
  { id: "gloss", label: "Gloss" },
  { id: "woodgrain", label: "Woodgrain" },
] as const;

const HARDWARE_GROUPS = [
  { id: "pull", label: "Pulls" },
  { id: "handleless", label: "Handleless pulls" },
  { id: "knob", label: "Knobs" },
  { id: "hinge", label: "Hinges" },
  { id: "slide", label: "Drawer slides" },
] as const;

const LIMITED_DOORS = DOOR_STYLES.filter(
  (style) => style.compatibleFinishCategories.length < FINISH_FAMILIES.length,
);
const finishCount = (category: string) => FINISHES.filter((f) => f.category === category).length;
const hardwareNames = (category: string) =>
  HARDWARE_OPTIONS.filter((h) => h.category === category).map((h) => h.name);
const listText = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const CATALOG_FAQS = [
  {
    question: "What door styles are in the Boise Cabinet Co catalog?",
    answer: `${DOOR_STYLES.length} door styles: ${listText(DOOR_STYLES.map((d) => d.name))}. Every door style is available on every cabinet we build.`,
  },
  {
    question: "How many cabinet finishes can I choose from?",
    answer: `${FINISHES.length} finishes in three families: ${FINISH_FAMILIES.map((f) => `${finishCount(f.id)} ${f.label.toLowerCase()}`).join(", ")}. Physical samples are confirmed in your light at the free in-home design visit.`,
  },
  {
    question: "What cabinet hardware is available?",
    answer: `${HARDWARE_OPTIONS.length} hardware options: ${HARDWARE_GROUPS.map((g) => `${g.label.toLowerCase()} (${listText(hardwareNames(g.id))})`).join("; ")}.`,
  },
  {
    question: "How long do cabinets take after I order from the catalog?",
    answer: "Your lead time is confirmed with your quote. Cabinets are built to order after you approve your drawings, finishes and hardware.",
  },
];

export default function CatalogPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Full Cabinet Catalog",
      description: `The complete product catalog from ${SITE_CONFIG.name}, browsable online as an interactive digital catalog.`,
      url: "/catalog",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Catalog", url: "/catalog" },
    ]),
    generateFAQSchema(CATALOG_FAQS),
  ];

  return (
    <InteriorPage kind="catalog"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col ">
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Catalog" }]} />
            <div className="mt-6">
              <PageHeader
                align="left"
                eyebrow="Product catalog"
                title={
                  <>
                    The complete <em className="brc-accent text-accent">catalog</em>
                  </>
                }
                description={
                  <ShortCopy
                    text={catalogDescription(
                      "Every door style, finish, cabinet, hardware option, and accessory we offer - in one interactive catalog. Flip through it below like a magazine, or switch to continuous scrolling. No download needed.",
                    )}
                  />
                }
                meta={
                  <span>
                    {DOOR_STYLES.length} door styles · {FINISHES.length} finishes ·{" "}
                    {CABINET_PRODUCTS.length} cabinets · {HARDWARE_OPTIONS.length} hardware ·{" "}
                    {ACCESSORY_FAMILIES.length} accessory families
                  </span>
                }
              />
            </div>
          </div>
        </Section>

        {/* Interactive, embedded catalog experience (above the download CTA) */}
        <Section spacing="sm" className="pt-0">
          <div className="container px-4">
            <CatalogPreview pdfUrl={CATALOG_PDF_PATH} />
            <nav aria-label="Browse cabinet products" className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link prefetch={false} className="rounded-lg border p-4 underline" href="/cabinets/kitchen">Kitchen cabinets</Link>
              <Link prefetch={false} className="rounded-lg border p-4 underline" href="/cabinets/bathroom">Bathroom vanities</Link>
              <Link prefetch={false} className="rounded-lg border p-4 underline" href="/cabinets/mudroom">Mudroom cabinetry</Link>
            </nav>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Use the toolbar to flip pages, scroll continuously, zoom, search, view thumbnails,
              or go fullscreen. On touch devices, swipe to turn pages and pinch to zoom.
            </p>
            <div className="mt-6 flex justify-center">
              <Button variant="brandOutline" size="lg" asChild>
                <a href={CATALOG_PDF_PATH} download data-testid="download-catalog-pdf">
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            </div>
          </div>
        </Section>

        <Section divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow="Catalog at a glance"
              title={<>What is in the catalog</>}
              description={`${DOOR_STYLES.length} door styles, ${FINISHES.length} finishes, ${CABINET_PRODUCTS.length} cabinet configurations, ${HARDWARE_OPTIONS.length} hardware options and ${ACCESSORY_FAMILIES.length} accessory families, all built to order.`}
              align="left"
              className="mb-8"
            />
            <div className="ed-grid-balance grid gap-6 md:grid-cols-2">
              <MarketingCard>
                <h3 className="ed-h4">{DOOR_STYLES.length} door styles</h3>
                <ul className="mt-3 grid list-none gap-2 p-0">
                  {DOOR_STYLES.map((style) => (
                    <li key={style.id} className="text-[0.9375rem] leading-relaxed text-foreground/90">
                      <span className="font-medium text-foreground">{style.name}:</span> {style.description}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Four are shaker profiles. See{" "}
                  <Link href="/shaker-cabinets" className="text-foreground underline underline-offset-2 hover:text-accent">
                    shaker cabinets
                  </Link>{" "}
                  or{" "}
                  <Link href="/compare" className="text-foreground underline underline-offset-2 hover:text-accent">
                    compare the door styles
                  </Link>
                  .
                </p>
              </MarketingCard>
              <MarketingCard>
                <h3 className="ed-h4">{FINISHES.length} finishes in three families</h3>
                <ul className="mt-3 grid list-none gap-2 p-0">
                  {FINISH_FAMILIES.map((family) => (
                    <li key={family.id} className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2 text-[0.9375rem] text-foreground/90">
                      <span>{family.label}</span>
                      <span className="font-medium text-foreground">{finishCount(family.id)} finishes</span>
                    </li>
                  ))}
                </ul>
                {LIMITED_DOORS.map((style) => (
                  <p key={style.id} className="mt-4 text-sm text-muted-foreground">
                    The {style.name} door is offered in {listText([...style.compatibleFinishCategories])} finishes; every other door style takes all three families.
                  </p>
                ))}
              </MarketingCard>
              <MarketingCard>
                <h3 className="ed-h4">{HARDWARE_OPTIONS.length} hardware options</h3>
                <ul className="mt-3 grid list-none gap-2 p-0">
                  {HARDWARE_GROUPS.map((group) => (
                    <li key={group.id} className="text-[0.9375rem] leading-relaxed text-foreground/90">
                      <span className="font-medium text-foreground">{group.label}:</span> {listText(hardwareNames(group.id))}
                    </li>
                  ))}
                </ul>
              </MarketingCard>
              <MarketingCard>
                <h3 className="ed-h4">{ACCESSORY_FAMILIES.length} accessory families</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-foreground/90">
                  {listText(ACCESSORY_FAMILIES.map((a) => a.name))}.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Your lead time is confirmed with your quote. See{" "}
                  <Link href="/accessories" className="text-foreground underline underline-offset-2 hover:text-accent">
                    cabinet accessories
                  </Link>{" "}
                  and{" "}
                  <Link href="/construction" className="text-foreground underline underline-offset-2 hover:text-accent">
                    how the boxes are built
                  </Link>
                  .
                </p>
              </MarketingCard>
            </div>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="ed-shell max-w-3xl">
            <SectionHeader
              eyebrow="Common questions"
              title={<>Cabinet catalog questions</>}
              align="left"
              className="mb-6"
            />
            <div className="grid gap-6">
              {CATALOG_FAQS.map((faq) => (
                <div key={faq.question}>
                  <h3 className="ed-h4">{faq.question}</h3>
                  <p className="mt-2 text-base leading-relaxed text-foreground/90">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <CatalogClosingCTA />
      </div>
    </></InteriorPage>
  );
}
