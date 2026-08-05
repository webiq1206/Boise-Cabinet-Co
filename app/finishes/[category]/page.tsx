import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { FinishOptionsSelector } from "@/components/catalog/OptionsSelector";
import { FinishDisclaimer } from "@/components/catalog/FinishDisclaimer";
import { Button } from "@/components/ui/button";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { FINISHES_BY_CATEGORY, type FinishCategory } from "@/shared/catalog";

const CATEGORIES: FinishCategory[] = ["matte", "gloss", "woodgrain"];

const CATEGORY_TITLES: Record<FinishCategory, string> = {
  matte: "Matte Finishes",
  gloss: "Gloss Finishes",
  woodgrain: "Woodgrain Finishes",
};

const CATEGORY_DESCRIPTIONS: Record<FinishCategory, string> = {
  matte:
    "Low-reflection matte and flat paints that hide fingerprints in busy kitchens and mudrooms.",
  gloss:
    "Gloss and high-gloss lacquers for contemporary slab kitchens and statement islands.",
  woodgrain:
    "Stained woodgrains with satin or matte topcoats, from white oak to deep, richly textured grains.",
};

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  const category = params.category as FinishCategory;
  if (!CATEGORIES.includes(category)) return {};
  return catalogMetadata(
    `/finishes/${category}`,
    CATEGORY_TITLES[category],
    catalogDescription(
      `${CATEGORY_DESCRIPTIONS[category]} Browse {company} ${category} cabinet finishes.`,
    ),
  );
}

export default function FinishCategoryPage({ params }: { params: { category: string } }) {
  const category = params.category as FinishCategory;
  if (!CATEGORIES.includes(category)) notFound();

  const finishes = FINISHES_BY_CATEGORY[category] ?? [];

  const schemas = [
    generateWebPageSchema({
      title: CATEGORY_TITLES[category],
      description: CATEGORY_DESCRIPTIONS[category],
      url: `/finishes/${category}`,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Finishes", url: "/finishes" },
      { name: CATEGORY_TITLES[category], url: `/finishes/${category}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Finishes", href: "/finishes" },
                { name: CATEGORY_TITLES[category] },
              ]}
            />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Finish library"
              title={
                <>
                  {CATEGORY_TITLES[category].replace(" Finishes", "")}{" "}
                  <em className="brc-accent text-accent">finishes</em>
                </>
              }
              description={CATEGORY_DESCRIPTIONS[category]}
              meta={<span>{finishes.length} options</span>}
            />
            <Button variant="brandOutline" size="sm" asChild className="mt-4">
              <Link href="/finishes">All finishes</Link>
            </Button>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <FinishOptionsSelector
              finishes={finishes}
              lockCategory
              showLinks
            />
            <FinishDisclaimer className="mt-8 max-w-3xl" />
          </div>
        </Section>

        <Section>
          <div className="container px-4 text-center">
            <Button variant="brand" asChild>
              <Link href="/estimate">
                Get an estimate <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
