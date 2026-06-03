import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { CollectionLandingTemplate } from "@/components/catalog/CollectionLandingTemplate";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { COLLECTIONS, getCollectionBySlug } from "@/shared/catalog";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const collection = getCollectionBySlug(params.slug);
  if (!collection) return {};
  return catalogMetadata(
    `/collections/${collection.slug}`,
    `${collection.name} Cabinets`,
    catalogDescription(`${collection.tagline} ${collection.description.slice(0, 120)}…`),
  );
}

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const collection = getCollectionBySlug(params.slug);
  if (!collection) notFound();

  const schemas = [
    generateWebPageSchema({
      title: `${collection.name} Cabinets`,
      description: collection.description,
      url: `/collections/${collection.slug}`,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Collections", url: "/collections" },
      { name: collection.name, url: `/collections/${collection.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <Section spacing="none" className="pt-4 md:pt-6 pb-3 md:pb-4">
        <div className="container px-4">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Collections", href: "/collections" },
              { name: collection.name },
            ]}
          />
        </div>
      </Section>
      <CollectionLandingTemplate collection={collection} />
    </>
  );
}
