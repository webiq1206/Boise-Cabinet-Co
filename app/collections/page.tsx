import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { TextLink } from "@/components/marketing/TextLink";
import { Chip } from "@/components/marketing/Chip";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { COLLECTIONS } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";

const TIER_LABELS = {
  entry: "Entry",
  mid: "Mid",
  premium: "Premium",
  luxury: "Luxury",
} as const;

export const metadata = catalogMetadata(
  "/collections",
  "Cabinet Collections",
  catalogDescription(
    "Compare our Custom Cabinets and Reserve cabinet lines from {company}. Built in Kuna, installed across the Treasure Valley.",
  ),
);

export default function CollectionsHubPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Cabinet Collections",
      description: `Two cabinet lines from ${SITE_CONFIG.name}.`,
      url: "/collections",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Collections", url: "/collections" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-8 md:pt-12">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Collections" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Product catalog"
              title={
                <>
                  Two cabinet{" "}
                  <em className="brc-accent text-accent">collections</em>
                </>
              }
              description={catalogDescription(
                "From our built-to-order Custom Cabinets to the curated Reserve Collection, every {company} line includes professional installation and our workmanship guarantee.",
              )}
            />
            <CatalogSearch className="mb-6" />
            <div className="flex flex-wrap gap-3">
              <Button variant="brand" asChild>
                <Link href="/design-studio">
                  Design Studio <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href="/compare">Compare collections</Link>
              </Button>
            </div>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <SectionHeader
              eyebrow="Lines"
              title={<>Find your fit</>}
              align="center"
              className="mb-10 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid sm:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              {COLLECTIONS.map((collection, i) => (
                <Reveal key={collection.id} delay={i * 50}>
                  <MarketingCard className="h-full flex flex-col p-0 overflow-hidden hover-elevate group relative">
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="absolute inset-0 z-0"
                      aria-label={collection.name}
                    />
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <Image
                        src={collection.heroImage}
                        alt={`${collection.name} custom cabinets, ${collection.tagline}`}
                        title={`${collection.name} Cabinet Collection | Boise Cabinet Co`}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover img-brand-grade group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 md:p-8 flex flex-col flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Chip>{TIER_LABELS[collection.priceTier]}</Chip>
                        <Chip>{collection.leadTime}</Chip>
                      </div>
                      <h2 className="text-xl font-sans font-light tracking-tight mb-2">
                        {collection.name}
                      </h2>
                      <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                        {collection.tagline}
                      </p>
                      <TextLink
                        href={`/collections/${collection.slug}`}
                        className="mt-4 relative z-10"
                        showArrow
                      >
                        Explore {collection.name}
                      </TextLink>
                    </div>
                  </MarketingCard>
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
