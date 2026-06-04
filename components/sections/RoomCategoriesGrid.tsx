import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { TextLink } from "@/components/marketing/TextLink";
import { Button } from "@/components/ui/button";
import { ROOM_CATEGORIES } from "@/shared/catalog/roomCategories";
import { CTA_PRIMARY_SHORT } from "@/shared/ctaCopy";

export function RoomCategoriesGrid() {
  const featured = ROOM_CATEGORIES.slice(0, 8);

  return (
    <Section id="cabinets" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow="Cabinet solutions"
          size="display"
          title={
            <>
              Custom cabinetry for every{" "}
              <em className="brc-accent text-accent">room</em>
            </>
          }
          description="From kitchen and bath to mudroom, closet, and garage, every cabinet is made to order with your choice of door style, finish, and hardware."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {featured.map((room, i) => (
            <Reveal key={room.slug} delay={i * 40}>
              <Link
                href={`/cabinets/${room.slug}`}
                className="group block rounded-sm border border-border bg-card overflow-hidden hover-elevate transition-shadow"
              >
                <div className="relative aspect-[3/2] bg-surface-greige overflow-hidden">
                  <Image
                    src={room.heroImage}
                    alt={`${room.name} custom cabinets`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-sans font-medium text-base mb-1 text-foreground group-hover:text-accent transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {room.description}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button variant="brandOutline" asChild>
            <Link href="/cabinets">View all rooms</Link>
          </Button>
          <Button variant="brand" asChild>
            <Link href="/design-studio">{CTA_PRIMARY_SHORT}</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
