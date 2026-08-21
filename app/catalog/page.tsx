import { Download } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CatalogFlipbook } from "@/components/catalog/CatalogFlipbook";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { Button } from "@/components/ui/button";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import {
  DOOR_STYLES,
  FINISHES,
  CABINET_PRODUCTS,
  HARDWARE_OPTIONS,
  ACCESSORY_FAMILIES,
} from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";

export const metadata = catalogMetadata(
  "/catalog",
  "Full Cabinet Catalog",
  catalogDescription(
    `Browse the complete {company} catalog online: ${DOOR_STYLES.length} door styles, ${FINISHES.length} finishes, ${CABINET_PRODUCTS.length} cabinet configurations, hardware, and accessories. Flip through the interactive catalog right on the page - no download required.`,
  ),
  {
    // First page of the catalog, cropped to OG dimensions. JPEG on purpose:
    // iMessage and some crawlers don't render WebP link previews.
    ogImage: {
      url: "/images/marketing/og-catalog.jpg",
      width: 1200,
      height: 630,
      alt: "Boise Cabinet Co full cabinet catalog cover",
    },
  },
);

const CATALOG_PDF_PATH = "/downloads/boise-cabinet-catalog.pdf";

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
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
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
                description={catalogDescription(
                  "Every door style, finish, cabinet, hardware option, and accessory we offer - in one interactive catalog. Flip through it below like a magazine, or switch to continuous scrolling. No download needed.",
                )}
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
            <CatalogFlipbook pdfUrl={CATALOG_PDF_PATH} downloadUrl={CATALOG_PDF_PATH} />
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

        <CatalogClosingCTA />
      </div>
    </>
  );
}
