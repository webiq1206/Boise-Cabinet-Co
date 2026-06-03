import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { TextLink } from "@/components/marketing/TextLink";
import { Chip } from "@/components/marketing/Chip";
import { Button } from "@/components/ui/button";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import {
  ROOM_CATEGORIES,
  getRoomBySlug,
  getCollectionBySlug,
  COLLECTIONS,
} from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { RoomCatalogShowcase } from "@/components/catalog/RoomCatalogShowcase";

export function generateStaticParams() {
  return ROOM_CATEGORIES.map((room) => ({ room: room.slug }));
}

export async function generateMetadata({ params }: { params: { room: string } }) {
  const room = getRoomBySlug(params.room);
  if (!room) return {};
  return catalogMetadata(
    `/cabinets/${room.slug}`,
    `${room.name} Cabinets`,
    catalogDescription(
      `${room.description.slice(0, 155)}… Custom ${room.name.toLowerCase()} cabinets from {company} in the Treasure Valley.`,
    ),
  );
}

export default function RoomCabinetPage({ params }: { params: { room: string } }) {
  const room = getRoomBySlug(params.room);
  if (!room) notFound();

  const defaultCollection = getCollectionBySlug(room.defaultCollectionId);

  const schemas = [
    generateWebPageSchema({
      title: `${room.name} Cabinets`,
      description: room.description,
      url: `/cabinets/${room.slug}`,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Cabinets", url: "/cabinets" },
      { name: room.name, url: `/cabinets/${room.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-0">
          <div className="relative aspect-[21/9] max-h-[360px] w-full overflow-hidden bg-muted">
            <Image
              src={room.heroImage}
              alt={`${room.name} custom cabinets`}
              fill
              priority
              sizes="100vw"
              className="object-cover img-brand-grade"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
          </div>
          <div className="container px-4 max-w-3xl pt-6">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Cabinets", href: "/cabinets" },
                { name: room.name },
              ]}
            />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Room catalog"
              title={
                <>
                  {room.name}{" "}
                  <em className="brc-accent text-accent">cabinets</em>
                </>
              }
              description={room.description}
              meta={
                defaultCollection ? (
                  <Chip>
                    Suggested collection: {defaultCollection.name}
                  </Chip>
                ) : undefined
              }
            />
            <Button variant="brand" asChild className="mt-4">
              <Link href="/design-studio">
                Design {room.name.toLowerCase()} cabinets{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-5xl">
            <RoomCatalogShowcase
              roomSlug={room.slug}
              roomName={room.name}
              defaultCollectionId={room.defaultCollectionId}
            />
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Typical cabinet types"
              title={<>What we build for {room.name.toLowerCase()}</>}
              description={`${SITE_CONFIG.name} sizes base, wall, tall, and specialty units for ${room.name.toLowerCase()} layouts common in Ada and Canyon County homes.`}
              align="left"
              className="mb-6"
            />
            <ul className="flex flex-wrap gap-2">
              {room.typicalCabinetTypes.map((type) => (
                <li key={type}>
                  <Chip className="capitalize">{type.replace(/-/g, " ")}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4">
            <SectionHeader
              eyebrow="Collections"
              title={<>Choose your cabinet line</>}
              description="Compare our four collections or start with the line we recommend for this room."
              align="center"
              className="mb-10 max-w-2xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {COLLECTIONS.map((c) => (
                <MarketingCard
                  key={c.id}
                  className={c.id === room.defaultCollectionId ? "ring-1 ring-accent/40" : ""}
                >
                  <h3 className="text-lg font-sans font-light mb-1">{c.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{c.tagline}</p>
                  {c.id === room.defaultCollectionId && (
                    <p className="text-xs text-accent mb-2">Recommended for {room.name}</p>
                  )}
                  <TextLink href={`/collections/${c.slug}`} showArrow>
                    View {c.name}
                  </TextLink>
                </MarketingCard>
              ))}
            </div>
          </div>
        </Section>

        <Section variant="inverse">
          <div className="container px-4 text-center max-w-lg mx-auto">
            <p className="text-inverse-muted mb-4">
              Configure layouts and finishes in Design Studio, then schedule a consultation.
            </p>
            <Button variant="brand" asChild>
              <Link href="/design-studio">Open Design Studio</Link>
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
