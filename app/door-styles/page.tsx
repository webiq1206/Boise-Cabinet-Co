import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { RelatedPostCards } from "@/components/marketing/RelatedPostCards";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { DoorOptionsSelector } from "@/components/catalog/OptionsSelector";
import { Button } from "@/components/ui/button";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";

export const metadata = catalogMetadata(
  "/door-styles",
  "Door Styles",
  catalogDescription(
    "Explore six door profiles from {company}. Slab, shaker, and mitered styles with compatible matte, gloss, and woodgrain finishes.",
  ),
);

export default function DoorStylesPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Door Styles",
      description: `Cabinet door profiles from ${SITE_CONFIG.name}.`,
      url: "/door-styles",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Door Styles", url: "/door-styles" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Door Styles" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Product catalog"
              title={
                <>
                  Door <em className="brc-accent text-accent">profiles</em>
                </>
              }
              description={catalogDescription(
                "From contemporary slab to classic shaker, every profile is machined in our Kuna shop with soft-close hinge boring standard.",
              )}
            />
            <CatalogSearch className="mb-8" />
            <Button variant="brand" asChild>
              <Link href="/estimate">
                Get an estimate <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <SectionHeader
              eyebrow="Profiles"
              title={<>Start with the favorites</>}
              align="center"
              className="mb-10 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="max-w-5xl mx-auto">
              <DoorOptionsSelector />
            </div>
          </div>
        </Section>
        <Section>
          <div className="container px-4">
            <RelatedPostCards path="/door-styles" title="Related cabinet guides and pages" />
          </div>
        </Section>
        <CatalogClosingCTA />
      </div>
    </>
  );
}
