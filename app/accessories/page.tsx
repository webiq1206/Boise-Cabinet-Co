import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/marketing/Section";
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
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
        <CinematicHero
          image={MARKETING_IMAGES.statementBand}
          alt="Cabinet interior accessories and pull-out organizers, Boise Cabinet Co"
          breadcrumbs={[{ name: "Home", href: "/" }, { name: "Accessories" }]}
          eyebrow="Product catalog"
          title={<>
                  Cabinet <em className="brc-accent text-accent">accessories</em>
                </>}
          description={catalogDescription(
                "Accessory families: roll-outs, trash pull-outs, lazy susans, blind corners, and more, specified during your {company} design consultation.",
              )}
        >
<Button variant="brand" asChild>
              <Link href="/estimate">
                Get an estimate <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
        </CinematicHero>
        <CatalogSearch className="mt-6 max-w-xl" />

        <Section variant="greige" divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow="Accessory families"
              title={<>Accessory families</>}
              className="mb-10"
            />
            <div className="ed-cards-3 gap-6">
              {ACCESSORY_FAMILIES.map((family, i) => (
                <Reveal key={family.id} delay={i * 30}>
                  <CatalogVisualCard
                    name={family.name}
                    description={family.description}
                    imageSrc={getAccessoryImagePath(family.slug)}
                    imageAlt={`${family.name} cabinet accessory`}
                    aspectRatio="1/1"
                    specs={[{ label: "Type", value: family.category }]}
                    primaryHref="/catalog"
                    primaryLabel="See cabinets that fit"
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
