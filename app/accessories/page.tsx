import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CatalogPageHero } from "@/components/catalog/CatalogPageHero";
import { CatalogVisualCard } from "@/components/catalog/visual";
import { getAccessoryImagePath } from "@/shared/catalog";
import { ACCESSORY_FAMILIES } from "@/shared/catalog";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";

export const metadata = catalogMetadata(
  "/accessories",
  "Cabinet Accessories",
  catalogDescription(
    "Roll-out trays, trash pull-outs, lazy susans, and corner solutions from {company}. Accessory families for interior upgrades.",
  ),
);

export default function AccessoriesPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Cabinet Accessories",
      description: `Interior cabinet accessories from ${SITE_CONFIG.name}.`,
      url: "/accessories",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Accessories", url: "/accessories" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Accessories" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Product catalog"
              title={
                <>
                  Cabinet <em className="brc-accent text-accent">accessories</em>
                </>
              }
              description={catalogDescription(
                "Accessory families: roll-outs, trash pull-outs, lazy susans, blind corners, and more, specified during your {company} design consultation.",
              )}
            />
            <CatalogPageHero
              src={MARKETING_IMAGES.statementBand}
              alt="Cabinet interior accessories and pull-out organizers, Boise Cabinet Co"
            />
            <CatalogSearch className="mb-8" />
            <Button variant="brand" asChild>
              <Link href="/design-studio">
                Design Studio <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <SectionHeader
              eyebrow="Accessory families"
              title={<>Accessory families</>}
              align="center"
              className="mb-10 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {ACCESSORY_FAMILIES.map((family, i) => (
                <Reveal key={family.id} delay={i * 30}>
                  <CatalogVisualCard
                    name={family.name}
                    description={family.description}
                    imageSrc={getAccessoryImagePath(family.slug)}
                    imageAlt={`${family.name} cabinet accessory`}
                    specs={[
                      { label: "Configurations", value: String(family.exampleSkus.length) },
                      { label: "Category", value: family.category },
                    ]}
                    primaryHref={`/products/base?family=${family.slug}`}
                    primaryLabel="Browse matching SKUs"
                    secondaryHref={`/products/base?family=${family.slug}`}
                    secondaryLabel="View configurations"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
        <CatalogClosingCTA />
      </div>
    </>
  );
}
