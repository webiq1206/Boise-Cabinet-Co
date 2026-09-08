import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CatalogVisualCard } from "@/components/catalog/visual";
import { COLLECTIONS, DOOR_STYLES, FINISHES } from "@/shared/catalog";
import { getDoorStyleImages } from "@/shared/catalog/entityImages";
import { Button } from "@/components/ui/button";
import { catalogMetadata } from "@/lib/catalog-metadata";

export const metadata = catalogMetadata(
  "/dealer",
  "Dealer Catalog | {company}",
  "{company} catalog reference for authorized dealers.",
  { noindex: true },
);

export default function DealerPortalPage() {
  return (
    <div className="flex flex-col pb-20">
      <Section spacing="sm" className="pt-8">
        <div className="container px-4 max-w-5xl">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Dealer Portal" }]} />
          <PageHeader
            align="left"
            eyebrow="Dealer portal"
            title="Product catalog"
            description={`${COLLECTIONS.length} collections · ${DOOR_STYLES.length} door styles · ${FINISHES.length} finishes · cabinet catalog`}
          />
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="brand" asChild>
              <Link href="/catalog">Browse products</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/search">Search catalog</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container px-4 max-w-5xl space-y-10">
          <div>
            <SectionHeader title="Collections" />
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              {COLLECTIONS.map((c) => (
                <CatalogVisualCard
                  key={c.slug}
                  name={c.name}
                  description={c.tagline}
                  imageSrc={c.heroImage}
                  imageAlt={`${c.name} cabinet line`}
                  specs={[
                    { label: "Lead time", value: c.leadTime },
                  ]}
                  primaryHref="/catalog"
                  primaryLabel="View collection"
                />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Door styles" />
            <div className="ed-cards-3 gap-6 mt-6">
              {DOOR_STYLES.map((d) => {
                const { primary } = getDoorStyleImages(d.slug, d.imagePath);
                return (
                  <CatalogVisualCard
                    key={d.slug}
                    name={d.name}
                    description={d.description}
                    imageSrc={primary}
                    imageAlt={`${d.name} door profile`}
                    primaryHref="/catalog"
                    primaryLabel="View profile"
                    secondaryHref="/catalog"
                    secondaryLabel="Compatible finishes"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
