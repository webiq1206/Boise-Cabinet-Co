import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { DoorStyleExplorer } from "@/components/catalog/DoorStyleExplorer";
import { ProductConfigurationCard } from "@/components/catalog/ProductConfigurationCard";
import { getProductsForDoorStyle } from "@/shared/catalog";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { DOOR_STYLES, getDoorStyleBySlug } from "@/shared/catalog";
import { Button } from "@/components/ui/button";

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

  const sampleProducts = getProductsForDoorStyle(style.slug, 6);

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
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Door Styles", href: "/door-styles" },
                { name: style.name },
              ]}
            />
            <DoorStyleExplorer style={style} />
          </div>
        </Section>

        {sampleProducts.length > 0 && (
          <Section variant="surface" divider>
            <div className="container px-4">
              <SectionHeader
                eyebrow="Configurations"
                title={<>Example products</>}
                align="center"
                className="mb-8 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {sampleProducts.map((p) => (
                  <ProductConfigurationCard key={p.id} product={p} />
                ))}
              </div>
              <div className="text-center mt-6">
                <Button variant="outline" asChild>
                  <Link href={`/products?doorStyle=${style.slug}`}>
                    View all configurations <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Section>
        )}
      </div>
    </>
  );
}
