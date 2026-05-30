import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { TextLink } from "@/components/marketing/TextLink";
import { CITY_HERO_IMAGES } from "@/shared/cityServiceImages";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
} from "@/lib/schema";
import { CITIES, TREASURE_VALLEY_CITIES } from "@/shared/contentData";
import { areaPath } from "@/lib/seo-routes";
import { CTA_PRIMARY, CTA_SECONDARY } from "@/shared/ctaCopy";
import { ConsultCTA } from "@/components/modals/ConsultCTA";
import { EstimateCTA } from "@/components/modals/EstimateCTA";

export const metadata = buildPageMetadata({
  kind: "about",
  path: "/areas",
  titleOverride: "Service Areas | Treasure Valley Remodeling",
  descriptionOverride:
    "Design-build remodeling across the Treasure Valley: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell, Idaho.",
});

export default function AreasHubPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Treasure Valley Service Areas",
      description: `Design-build remodeling serving ${TREASURE_VALLEY_CITIES}.`,
      url: "/areas",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Service Areas", url: "/areas" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-8 md:pt-12">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Service Areas" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              title={
                <>
                  Treasure Valley service{" "}
                  <em className="brc-accent text-accent">areas</em>
                </>
              }
              description={`We serve homeowners across ${TREASURE_VALLEY_CITIES}, and surrounding communities with kitchen, bathroom, whole-home, and addition remodeling under one design-build team.`}
            />
            <p className="sr-only" data-speakable="summary">
              Treasure Valley design-build remodeling service areas.
            </p>
            <div className="flex flex-wrap gap-3">
              <ConsultCTA variant="brand">
                {CTA_PRIMARY} <ArrowRight className="h-4 w-4" />
              </ConsultCTA>
              <EstimateCTA variant="brandOutline">
                {CTA_SECONDARY}
              </EstimateCTA>
            </div>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {CITIES.map((city) => {
                const img = CITY_HERO_IMAGES[city.slug];
                return (
                <MarketingCard key={city.slug} className="h-full p-0 overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={img}
                      alt={`Remodeling in ${city.name}, Idaho`}
                      fill
                      sizes="300px"
                      className="object-cover img-brand-grade"
                    />
                  </div>
                  <div className="p-6">
                  <h2 className="font-sans font-medium text-sm mb-2 text-foreground">
                    {city.name}, Idaho
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Design-build remodeling in {city.name} and {city.county === "ada" ? "Ada" : "Canyon"} County.
                  </p>
                  <TextLink href={areaPath(city.slug)} showArrow>
                    View {city.name} services
                  </TextLink>
                  </div>
                </MarketingCard>
              );
              })}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
