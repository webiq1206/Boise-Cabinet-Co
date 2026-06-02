import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { FinishSwatchGrid } from "@/components/catalog/FinishSwatchGrid";
import { Chip } from "@/components/marketing/Chip";
import { TextLink } from "@/components/marketing/TextLink";
import { Button } from "@/components/ui/button";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import {
  DOOR_STYLES,
  getDoorStyleBySlug,
  getFinishesForDoorStyle,
  COLLECTIONS,
} from "@/shared/catalog";

export function generateStaticParams() {
  return DOOR_STYLES.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const style = getDoorStyleBySlug(params.slug);
  if (!style) return {};
  return catalogMetadata(
    `/door-styles/${style.slug}`,
    `${style.name} Door Style`,
    catalogDescription(style.description.slice(0, 160) + "…"),
  );
}

export default function DoorStyleDetailPage({ params }: { params: { slug: string } }) {
  const style = getDoorStyleBySlug(params.slug);
  if (!style) notFound();

  const finishes = getFinishesForDoorStyle(style.slug);
  const collections = COLLECTIONS.filter((c) =>
    style.availableInCollections.includes(c.id),
  );

  const schemas = [
    generateWebPageSchema({
      title: `${style.name} Door Style`,
      description: style.description,
      url: `/door-styles/${style.slug}`,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Door Styles", url: "/door-styles" },
      { name: style.name, url: `/door-styles/${style.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-8 md:pt-12">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Door Styles", href: "/door-styles" },
                { name: style.name },
              ]}
            />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Door profile"
              title={
                <>
                  {style.name}{" "}
                  <em className="brc-accent text-accent">doors</em>
                </>
              }
              description={style.description}
              meta={
                <div className="flex flex-wrap gap-2">
                  {style.compatibleFinishCategories.map((cat) => (
                    <Chip key={cat} className="capitalize">
                      {cat} finishes
                    </Chip>
                  ))}
                </div>
              }
            />
            <Button variant="brand" asChild className="mt-4">
              <Link href="/design-studio">
                Use in Design Studio <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Construction"
              title={<>How it is built</>}
              description={style.constructionNotes}
              align="left"
              className="mb-0"
            />
          </div>
        </Section>

        <Section divider>
          <div className="container px-4">
            <SectionHeader
              eyebrow="Collections"
              title={<>Available in these lines</>}
              align="center"
              className="mb-8 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {collections.map((c) => (
                <MarketingCard key={c.id}>
                  <h3 className="font-medium mb-1">{c.name}</h3>
                  <TextLink href={`/collections/${c.slug}`} showArrow>
                    View collection
                  </TextLink>
                </MarketingCard>
              ))}
            </div>
          </div>
        </Section>

        <Section variant="surface" divider>
          <div className="container px-4">
            <SectionHeader
              eyebrow="Compatible finishes"
              title={<>Finishes for {style.name}</>}
              description={`${finishes.length} finishes in our library pair with this door profile.`}
              align="center"
              className="mb-10 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <FinishSwatchGrid finishes={finishes} />
          </div>
        </Section>
      </div>
    </>
  );
}
