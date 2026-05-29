import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/marketing/Section";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
} from "@/lib/schema";
import { CITIES, TREASURE_VALLEY_CITIES } from "@/shared/contentData";
import { areaPath } from "@/lib/seo-routes";
import { CTA_PRIMARY, CTA_SECONDARY } from "@/shared/ctaCopy";

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
            <h1 className="font-sans font-light text-display md:text-[2.75rem] tracking-tight text-foreground mt-6 mb-6">
              Treasure Valley service areas
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8" data-speakable="summary">
              We serve homeowners across {TREASURE_VALLEY_CITIES}, and surrounding communities
              with kitchen, bathroom, whole-home, and addition remodeling under one design-build team.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="brand" asChild>
                <Link href="/#consult">
                  {CTA_PRIMARY} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href="/#calculator">{CTA_SECONDARY}</Link>
              </Button>
            </div>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {CITIES.map((city) => (
                <MarketingCard key={city.slug} className="h-full">
                  <h2 className="font-sans font-medium text-sm mb-2 text-foreground">
                    {city.name}, Idaho
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Design-build remodeling in {city.name} and {city.county === "ada" ? "Ada" : "Canyon"} County.
                  </p>
                  <Link
                    href={areaPath(city.slug)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
                  >
                    View {city.name} services
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </MarketingCard>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
