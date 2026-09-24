import { InteriorPage } from '@/components/approved/InteriorLayout';
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { CatalogVisualCard } from "@/components/catalog/visual";
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { catalogDescription,catalogMetadata } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema,generateWebPageSchema } from "@/lib/schema";
import { ACCESSORY_FAMILIES,getAccessoryImagePath } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = withBrandPageMetadata((catalogMetadata(
  "/accessories",
  "Cabinet Accessories",
  catalogDescription(
    "Roll-out trays, trash pull-outs, lazy susans, and corner solutions from {company}. Accessory families for interior upgrades.",
  ),
)), "/accessories");

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
    <InteriorPage kind="accessories"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <CinematicHero
          image={getAccessoryImagePath("partition")}
          alt="Vertical cabinet dividers organize cutting boards and baking sheets"
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
    </></InteriorPage>
  );
}
