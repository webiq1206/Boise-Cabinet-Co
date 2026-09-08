import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CatalogVisualCard } from "@/components/catalog/visual";
import { OSC_CONSTRUCTION, COLLECTIONS, DOOR_STYLES } from "@/shared/catalog";
import { getDoorStyleImages } from "@/shared/catalog/entityImages";
import { Button } from "@/components/ui/button";
import { catalogMetadata } from "@/lib/catalog-metadata";

export const metadata = catalogMetadata(
  "/installer",
  "Installer Resources | {company}",
  "Construction specs and catalog reference for installation partners.",
  { noindex: true },
);

export default function InstallerPortalPage() {
  return (
    <div className="flex flex-col pb-20">
      <Section spacing="sm" className="pt-8">
        <div className="container px-4 max-w-5xl">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Installer Portal" }]} />
          <PageHeader
            align="left"
            eyebrow="Installer portal"
            title="Installation reference"
            description={`${OSC_CONSTRUCTION.hingeType}. ${OSC_CONSTRUCTION.drawerSlides}.`}
          />
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="brand" asChild>
              <Link href="/construction">Construction standards</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/catalog">Product codes</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container px-4 max-w-5xl space-y-10">
          <div>
            <SectionHeader title="Cabinet lines" />
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              {COLLECTIONS.map((c) => (
                <CatalogVisualCard
                  key={c.slug}
                  name={c.name}
                  description={c.description}
                  imageSrc={c.heroImage}
                  imageAlt={`${c.name} cabinets`}
                  specs={[
                    { label: "Lead time", value: c.leadTime },
                    { label: "Price tier", value: c.priceTier },
                  ]}
                  primaryHref="/catalog"
                  primaryLabel="Specifications"
                />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Door profiles" />
            <div className="ed-cards-3 gap-6 mt-6">
              {DOOR_STYLES.map((d) => {
                const { primary } = getDoorStyleImages(d.slug, d.imagePath);
                return (
                  <CatalogVisualCard
                    key={d.slug}
                    name={d.name}
                    description={d.constructionNotes}
                    imageSrc={primary}
                    imageAlt={`${d.name} door construction`}
                    primaryHref="/catalog"
                    primaryLabel="Profile details"
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
