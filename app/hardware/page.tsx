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
import { HARDWARE_OPTIONS } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";

const FINISH_LABELS: Record<string, string> = {
  "matte-black": "Matte black",
  "brushed-nickel": "Brushed nickel",
  "polished-chrome": "Polished chrome",
  "brushed-gold": "Brushed gold",
  "oil-rubbed-bronze": "Oil-rubbed bronze",
  stainless: "Stainless",
};

export const metadata = catalogMetadata(
  "/hardware",
  "Cabinet Hardware",
  catalogDescription(
    "Pulls, knobs, hinges, and slides from {company}. Soft-close hardware packages for every cabinet collection.",
  ),
);

export default function HardwarePage() {
  const schemas = [
    generateWebPageSchema({
      title: "Cabinet Hardware",
      description: `Hardware options from ${SITE_CONFIG.name}.`,
      url: "/hardware",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Hardware", url: "/hardware" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-8 md:pt-12">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Hardware" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Product catalog"
              title={
                <>
                  Cabinet <em className="brc-accent text-accent">hardware</em>
                </>
              }
              description={catalogDescription(
                "Bar pulls, cup pulls, integrated channels, hinges, and drawer slides, selected to match your door style and finish during design.",
              )}
            />
            <CatalogPageHero
              src={MARKETING_IMAGES.process}
              alt="Cabinet hardware samples on One Source shaker doors, Boise Cabinet Co"
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
              eyebrow="Options"
              title={<>Pulls, hinges &amp; slides</>}
              align="center"
              className="mb-10 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {HARDWARE_OPTIONS.map((item, i) => (
                <Reveal key={item.id} delay={i * 30}>
                  <MarketingCard className="h-full flex flex-col p-0 overflow-hidden">
                    <CatalogProductImage
                      slug={item.slug}
                      name={item.name}
                      type="hardware"
                      className="rounded-none"
                    />
                    <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Chip className="capitalize">{item.category}</Chip>
                      <Chip>{FINISH_LABELS[item.finish] ?? item.finish}</Chip>
                      {item.isSoftClose && <Chip>Soft-close</Chip>}
                    </div>
                    <h2 className="text-lg font-sans font-light tracking-tight mb-2">
                      {item.name}
                    </h2>
                    <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                      {item.description}
                    </p>
                    {item.centerToCenterMm != null && (
                      <p className="text-xs text-muted-foreground mt-3">
                        {item.centerToCenterMm}mm center-to-center
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
