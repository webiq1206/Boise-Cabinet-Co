import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { FinishSwatchGrid } from "@/components/catalog/FinishSwatchGrid";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { Button } from "@/components/ui/button";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { FINISHES_BY_CATEGORY } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";

export const metadata = catalogMetadata(
  "/finishes",
  "Cabinet Finishes",
  catalogDescription(
    "Browse 108 matte, gloss, and woodgrain cabinet finishes from {company}. See swatches and pair with door styles in Design Studio.",
  ),
);

export default function FinishesPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Cabinet Finishes",
      description: `Finish library from ${SITE_CONFIG.name}.`,
      url: "/finishes",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Finishes", url: "/finishes" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Finishes" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Product catalog"
              title={
                <>
                  Finish <em className="brc-accent text-accent">library</em>
                </>
              }
              description={catalogDescription(
                "Matte paints, gloss lacquers, and woodgrain stains engineered for Idaho kitchens and baths. Filter by category or search the full {company} catalog.",
              )}
              meta={
                <span>
                  {FINISHES_BY_CATEGORY.matte?.length ?? 0} matte ·{" "}
                  {FINISHES_BY_CATEGORY.gloss?.length ?? 0} gloss ·{" "}
                  {FINISHES_BY_CATEGORY.woodgrain?.length ?? 0} woodgrain
                </span>
              }
            />
            <CatalogSearch className="mb-8" />
            <div className="flex flex-wrap gap-3 mb-2">
              <Button variant="brandOutline" size="sm" asChild>
                <Link href="/finishes/matte">Matte</Link>
              </Button>
              <Button variant="brandOutline" size="sm" asChild>
                <Link href="/finishes/gloss">Gloss</Link>
              </Button>
              <Button variant="brandOutline" size="sm" asChild>
                <Link href="/finishes/woodgrain">Woodgrain</Link>
              </Button>
            </div>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <FinishSwatchGrid />
          </div>
        </Section>

        <Section>
          <div className="container px-4 text-center max-w-lg mx-auto">
            <p className="text-muted-foreground mb-4">
              Pair finishes with door styles and collections in Design Studio.
            </p>
            <Button variant="brand" asChild>
              <Link href="/design-studio">
                Open Design Studio <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>
        <CatalogClosingCTA />
      </div>
    </>
  );
}
