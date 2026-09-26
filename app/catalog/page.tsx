import { InteriorPage } from '@/components/approved/InteriorLayout';
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CatalogPreview } from "@/components/catalog/CatalogPreview";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Section } from "@/components/marketing/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { catalogDescription,catalogMetadata } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema,generateWebPageSchema } from "@/lib/schema";
import {
ACCESSORY_FAMILIES,
CABINET_PRODUCTS,
DOOR_STYLES,
FINISHES,
HARDWARE_OPTIONS,
} from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { Download } from "lucide-react";

export const metadata = withBrandPageMetadata((catalogMetadata(
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
)), "/catalog");

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
    <InteriorPage kind="catalog"><>
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
            <CatalogPreview pdfUrl={CATALOG_PDF_PATH} />
            <nav aria-label="Browse cabinet products" className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <a className="rounded-lg border p-4 underline" href="/cabinets/kitchen">Kitchen cabinets</a>
              <a className="rounded-lg border p-4 underline" href="/cabinets/bathroom">Bathroom vanities</a>
              <a className="rounded-lg border p-4 underline" href="/cabinets/mudroom">Mudroom cabinetry</a>
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

        <CatalogClosingCTA />
      </div>
    </></InteriorPage>
  );
}
