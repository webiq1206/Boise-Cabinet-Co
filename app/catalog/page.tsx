import Link from "next/link";
import { Download } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CatalogPageHero } from "@/components/catalog/CatalogPageHero";
import { CatalogVisualCard } from "@/components/catalog/visual";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { Button } from "@/components/ui/button";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import {
  COLLECTIONS,
  DOOR_STYLES,
  FINISHES,
  CABINET_PRODUCTS,
  HARDWARE_OPTIONS,
  ACCESSORY_FAMILIES,
  ROOM_CATEGORIES,
  getDoorStyleImages,
  getFinishImages,
  getHardwareImagePath,
  getAccessoryFamilyImagePath,
  seoAlt,
} from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";

export const metadata = catalogMetadata(
  "/catalog",
  "Full Cabinet Catalog",
  catalogDescription(
    `Browse the complete {company} catalog: ${DOOR_STYLES.length} door styles, ${FINISHES.length} finishes, ${CABINET_PRODUCTS.length} cabinet configurations, hardware, and accessories. Search, filter, or download the full catalog as a PDF.`,
  ),
);

const CATALOG_PDF_PATH = "/downloads/boise-cabinet-catalog.pdf";

function representativeFinishSwatch(): string | undefined {
  const f = FINISHES.find((x) => x.imagePath) ?? FINISHES[0];
  return f ? getFinishImages(f.slug, f.imagePath).swatch : undefined;
}

export default function CatalogPage() {
  const hubCards = [
    {
      name: "Door Styles",
      description: "Shaker, slab, and specialty profiles that define your cabinet look.",
      imageSrc: getDoorStyleImages(DOOR_STYLES[0]?.slug ?? "", DOOR_STYLES[0]?.imagePath).primary,
      aspectRatio: "4/3",
      count: DOOR_STYLES.length,
      href: "/door-styles",
    },
    {
      name: "Finishes",
      description: "Matte paints, gloss lacquers, and woodgrain stains in every color family.",
      imageSrc: representativeFinishSwatch(),
      aspectRatio: "1/1",
      count: FINISHES.length,
      href: "/finishes",
    },
    {
      name: "Cabinets",
      description: "Base, wall, tall, vanity, and specialty cabinet configurations.",
      imageSrc: ROOM_CATEGORIES.find((r) => r.slug === "kitchen")?.heroImage,
      aspectRatio: "3/2",
      count: CABINET_PRODUCTS.length,
      href: "/products",
    },
    {
      name: "Collections",
      description: "Curated cabinet lines that bundle doors, finishes, and construction.",
      imageSrc: COLLECTIONS[0]?.heroImage,
      aspectRatio: "3/2",
      count: COLLECTIONS.length,
      href: "/collections",
    },
    {
      name: "Hardware",
      description: "Pulls, knobs, hinges, and slides to complete every cabinet.",
      imageSrc: HARDWARE_OPTIONS[0] ? getHardwareImagePath(HARDWARE_OPTIONS[0].slug) : undefined,
      aspectRatio: "1/1",
      count: HARDWARE_OPTIONS.length,
      href: "/hardware",
    },
    {
      name: "Accessories",
      description: "Roll-outs, lazy susans, trash pull-outs, and organization upgrades.",
      imageSrc: ACCESSORY_FAMILIES[0]
        ? getAccessoryFamilyImagePath(ACCESSORY_FAMILIES[0].slug)
        : undefined,
      aspectRatio: "1/1",
      count: ACCESSORY_FAMILIES.length,
      href: "/accessories",
    },
    {
      name: "Shop by Room",
      description: "See cabinetry organized by kitchen, bath, laundry, and more.",
      imageSrc: ROOM_CATEGORIES.find((r) => r.slug === "built-ins")?.heroImage,
      aspectRatio: "3/2",
      count: ROOM_CATEGORIES.length,
      href: "/cabinets",
    },
  ];

  const schemas = [
    generateWebPageSchema({
      title: "Full Cabinet Catalog",
      description: `The complete product catalog from ${SITE_CONFIG.name}.`,
      url: "/catalog",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Catalog", url: "/catalog" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Catalog" }]} />
            <CatalogPageHero
              alt="Boise Cabinet Co full product catalog"
              title="Full cabinet catalog"
            />
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <PageHeader
                align="left"
                eyebrow="Product catalog"
                title={
                  <>
                    The complete <em className="brc-accent text-accent">catalog</em>
                  </>
                }
                description={catalogDescription(
                  "Every door style, finish, cabinet, hardware option, and accessory we offer - always in sync with our products. Browse below or download the full catalog as a PDF.",
                )}
                meta={
                  <span>
                    {DOOR_STYLES.length} door styles · {FINISHES.length} finishes ·{" "}
                    {CABINET_PRODUCTS.length} cabinets · {HARDWARE_OPTIONS.length} hardware ·{" "}
                    {ACCESSORY_FAMILIES.length} accessory families
                  </span>
                }
              />
              <div className="shrink-0">
                <Button variant="brand" size="lg" asChild>
                  <a href={CATALOG_PDF_PATH} download data-testid="download-catalog-pdf">
                    <Download className="h-4 w-4" />
                    Download catalog (PDF)
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* Hub: organized entry points */}
        <Section variant="greige" divider>
          <div className="container px-4">
            <h2 className="mb-6 text-lg font-medium">Browse by category</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hubCards.map((card) => (
                <CatalogVisualCard
                  key={card.name}
                  name={card.name}
                  description={card.description}
                  imageSrc={card.imageSrc}
                  imageAlt={seoAlt(card.name, "custom cabinet catalog", card.name)}
                  aspectRatio={card.aspectRatio}
                  specs={[{ label: "Options", value: String(card.count) }]}
                  primaryHref={card.href}
                  primaryLabel={`Browse ${card.name}`}
                  secondaryHref="#browse"
                  secondaryLabel="Quick filter"
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Unified, filterable browse experience */}
        <Section id="browse">
          <div className="container px-4">
            <h2 className="mb-6 text-lg font-medium">Browse everything</h2>
            <CatalogBrowser />
          </div>
        </Section>

        <CatalogClosingCTA />
      </div>
    </>
  );
}
