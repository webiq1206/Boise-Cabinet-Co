import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { TextLink } from "@/components/marketing/TextLink";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { ROOM_CATEGORIES } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { getCollectionBySlug } from "@/shared/catalog";

export const metadata = catalogMetadata(
  "/cabinets",
  "Cabinet Catalog by Room",
  catalogDescription(
    "Browse custom cabinets by room — kitchen, bath, laundry, mudroom, and more. {company} builds and installs cabinetry across the Treasure Valley.",
  ),
);

export default function CabinetsHubPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Cabinet Catalog",
      description: `Custom cabinets by room from ${SITE_CONFIG.name}.`,
      url: "/cabinets",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Cabinets", url: "/cabinets" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-8 md:pt-12">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Cabinets" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Product catalog"
              title={
                <>
                  Cabinets by <em className="brc-accent text-accent">room</em>
                </>
              }
              description={catalogDescription(
                "Explore how {company} designs and builds cabinetry for every space in your Treasure Valley home — from primary kitchens to garage storage.",
              )}
            />
            <CatalogSearch className="mb-8" />
            <Button variant="brand" asChild>
              <Link href="/design-studio">
                Start in Design Studio <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <SectionHeader
              eyebrow="Rooms"
              title={<>Twelve room categories</>}
              description="Each room page outlines typical cabinet types and our recommended collection line."
              align="center"
              className="mb-10 max-w-2xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {ROOM_CATEGORIES.map((room, i) => {
                const collection = getCollectionBySlug(room.defaultCollectionId);
                const collectionName = collection?.name ?? "Semi-Custom";

                return (
                  <Reveal key={room.id} delay={i * 30}>
                    <MarketingCard className="h-full flex flex-col p-0 overflow-hidden hover-elevate group relative">
                      <Link
                        href={`/cabinets/${room.slug}`}
                        className="absolute inset-0 z-0"
                        aria-label={`${room.name} cabinets`}
                      />
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <Image
                          src={room.heroImage}
                          alt={`${room.name} custom cabinets`}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover img-brand-grade transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="p-6 md:p-8 flex flex-col flex-1">
                        <h2 className="text-lg font-sans font-light tracking-tight mb-2">
                          {room.name}
                        </h2>
                        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 leading-relaxed">
                          {room.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-3">
                          Suggested line: {collectionName}
                        </p>
                        <TextLink
                          href={`/cabinets/${room.slug}`}
                          className="mt-4 relative z-10"
                          showArrow
                        >
                          Explore {room.name}
                        </TextLink>
                      </div>
                    </MarketingCard>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
