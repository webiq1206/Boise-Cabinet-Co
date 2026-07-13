import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { RelatedPostCards } from "@/components/marketing/RelatedPostCards";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { DoorOptionsSelector } from "@/components/catalog/OptionsSelector";
import { Button } from "@/components/ui/button";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { DOOR_STYLES } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";

const DOOR_BEST_FOR: Record<string, string> = {
  slab: "Modern, mid-century, and contemporary homes",
  "three-piece": "Showing off woodgrain warmth and depth",
  "modern-shaker": "The versatile all-rounder that suits most homes",
  "thin-shaker": "Transitional homes wanting understated detail",
  "alpha-shaker": "Clean, streamlined transitional kitchens",
  "beta-shaker": "Traditional and craftsman-style homes",
};

export const metadata = catalogMetadata(
  "/door-styles",
  "Door Styles",
  catalogDescription(
    "Explore six door profiles from {company}. Slab, shaker, and mitered styles with compatible matte, gloss, and woodgrain finishes.",
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
        <Section spacing="sm" className="pt-4 md:pt-6">
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
                "From contemporary slab to classic shaker, every profile is machined in our Meridian shop with soft-close hinge boring standard.",
              )}
            />
            <CatalogSearch className="mb-8" />
            <Button variant="brand" asChild>
              <Link href="/estimate">
                Get an estimate <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <SectionHeader
              eyebrow="Profiles"
              title={<>Start with the favorites</>}
              align="center"
              className="mb-10 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="max-w-5xl mx-auto">
              <DoorOptionsSelector />
            </div>
          </div>
        </Section>
        <Section divider>
          <div className="container px-4 max-w-4xl">
            <SectionHeader
              eyebrow="Compare"
              title={
                <>
                  Door styles at a <em className="brc-accent text-accent">glance</em>
                </>
              }
              align="center"
              className="mb-8 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="overflow-x-auto rounded-sm border border-border">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border bg-surface-muted">
                    <th className="px-4 py-3 text-foreground whitespace-nowrap">Door style</th>
                    <th className="px-4 py-3 text-foreground">Profile and look</th>
                    <th className="px-4 py-3 text-foreground whitespace-nowrap">Finishes</th>
                    <th className="px-4 py-3 text-foreground">Best for</th>
                  </tr>
                </thead>
                <tbody>
                  {DOOR_STYLES.map((d) => (
                    <tr key={d.slug} className="border-b border-border/60 last:border-0 align-top">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/door-styles/${d.slug}`}
                          className="text-foreground hover:text-accent"
                        >
                          {d.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.description}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {d.compatibleFinishCategories
                          .map((c) => c[0].toUpperCase() + c.slice(1))
                          .join(", ")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {DOOR_BEST_FOR[d.slug] ?? "Most Treasure Valley homes"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section>
          <div className="container px-4">
            <RelatedPostCards path="/door-styles" title="Related cabinet guides and pages" />
          </div>
        </Section>
        <CatalogClosingCTA />
      </div>
    </>
  );
}
