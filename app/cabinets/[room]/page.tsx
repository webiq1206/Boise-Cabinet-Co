import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/button";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateServiceSchema,
  generateWebPageSchema,
} from "@/lib/schema";
import {
  ROOM_CATEGORIES,
  getRoomBySlug,
  CABINET_PRODUCTS,
} from "@/shared/catalog";
import { getRoomFaqs } from "@/shared/catalog/roomFaqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CabinetOptionsSelector } from "@/components/catalog/OptionsSelector";
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

  // Pre-filter the catalog to the cabinet types this room uses, so the grid
  // leads with relevant options (homeowner-first) rather than the full 320.
  const roomCats = new Set<string>();
  for (const t of room.typicalCabinetTypes) {
    if (t.includes("vanity")) roomCats.add("vanity");
    else if (t.includes("wall")) roomCats.add("wall");
    else if (t.includes("tall")) roomCats.add("tall");
    else if (t.includes("base")) roomCats.add("base");
  }
  if (roomCats.size === 0) ["base", "wall", "tall"].forEach((c) => roomCats.add(c));
  const roomCabinets = CABINET_PRODUCTS.filter((c) => roomCats.has(c.category));

  const faqs = getRoomFaqs(room);

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
    generateServiceSchema(
      `Custom ${room.name} Cabinets`,
      `${room.description} Designed, built, and installed by ${SITE_CONFIG.name} for Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.`,
    ),
    generateFAQSchema(faqs),
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
            />
            <Button variant="brand" asChild className="mt-4">
              <Link href="/estimate">
                Get a {room.name.toLowerCase()} cabinet estimate{" "}
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
          <div className="container px-4 max-w-5xl">
            <SectionHeader
              eyebrow="Cabinets for this room"
              title={<>What we build for {room.name.toLowerCase()}</>}
              description={`${SITE_CONFIG.name} sizes these cabinets to fit ${room.name.toLowerCase()} layouts common in Ada and Canyon County homes. Filter by what you need or see the full range.`}
              align="left"
              className="mb-6"
            />
            <CabinetOptionsSelector cabinets={roomCabinets} />
          </div>
        </Section>

        <Section variant="inverse">
          <div className="container px-4 text-center max-w-lg mx-auto">
            <p className="text-inverse-muted mb-4">
              Tell us about your layout and finishes to get a planning estimate, then schedule a consultation.
            </p>
            <Button variant="brand" asChild>
              <Link href="/estimate">Get an estimate</Link>
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
