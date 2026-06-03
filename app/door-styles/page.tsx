import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { Chip } from "@/components/marketing/Chip";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { DoorStyleHero } from "@/components/catalog/DoorStyleHero";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { DOOR_STYLES } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";

export const metadata = catalogMetadata(
  "/door-styles",
  "Door Styles",
  catalogDescription(
    "Explore slab, shaker, and traditional door profiles from {company}. Six profiles with compatible matte, gloss, and woodgrain finishes.",
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
        <Section spacing="sm" className="pt-8 md:pt-12">
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
                "From contemporary slab to Reserve-exclusive Alpha Shaker, every profile is machined in our Kuna shop with soft-close hinge boring standard.",
              )}
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
              eyebrow="Profiles"
              title={<>Six door styles</>}
              align="center"
              className="mb-10 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {DOOR_STYLES.map((style, i) => (
                <Reveal key={style.id} delay={i * 40}>
                  <Link href={`/door-styles/${style.slug}`} className="block h-full group">
                    <MarketingCard className="h-full flex flex-col p-0 overflow-hidden hover-elevate transition-colors">
                      <DoorStyleHero slug={style.slug} name={style.name} className="rounded-none" />
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {style.compatibleFinishCategories.map((cat) => (
                            <Chip key={cat} className="capitalize">
                              {cat}
                            </Chip>
                          ))}
                        </div>
                        <h2 className="text-lg font-sans font-light tracking-tight mb-2 group-hover:text-primary transition-colors">
                          {style.name}
                        </h2>
                        <p className="text-sm text-muted-foreground flex-1 line-clamp-4 leading-relaxed">
                          {style.description}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                          View details →
                        </span>
                      </div>
                    </MarketingCard>
                  </Link>
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
