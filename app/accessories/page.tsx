import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Chip } from "@/components/marketing/Chip";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { CatalogPageHero } from "@/components/catalog/CatalogPageHero";
import { CatalogProductImage } from "@/components/catalog/CatalogProductImage";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { ACCESSORIES } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";

export const metadata = catalogMetadata(
  "/accessories",
  "Cabinet Accessories",
  catalogDescription(
    "Pull-out shelves, pantry systems, waste solutions, and lighting from {company}. Interior upgrades for every collection.",
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
        <Section spacing="sm" className="pt-8 md:pt-12">
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
                "Organize every inch with pull-outs, lazy susans, waste solutions, and integrated lighting — specified during your {company} design consultation.",
              )}
            />
            <CatalogPageHero
              src={MARKETING_IMAGES.statementBand}
              alt="Cabinet interior accessories and pull-out organizers — Boise Cabinet Co"
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
              eyebrow="Catalog"
              title={<>Interior upgrades</>}
              align="center"
              className="mb-10 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {ACCESSORIES.map((item, i) => (
                <Reveal key={item.id} delay={i * 30}>
                  <MarketingCard id={item.slug} className="h-full flex flex-col scroll-mt-24 p-0 overflow-hidden">
                    <CatalogProductImage
                      slug={item.slug}
                      name={item.name}
                      type="accessory"
                      className="rounded-none"
                    />
                    <div className="p-6 flex flex-col flex-1">
                    <Chip className="mb-3 capitalize w-fit">{item.category}</Chip>
                    <h2 className="text-lg font-sans font-light tracking-tight mb-2">
                      {item.name}
                    </h2>
                    <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                      {item.description}
                    </p>
                    {item.minCabinetWidth != null && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Min. cabinet width: {item.minCabinetWidth}&quot;
                      </p>
                    )}
                    </div>
                  </MarketingCard>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
