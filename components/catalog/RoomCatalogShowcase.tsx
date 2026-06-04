import Link from "next/link";
import { getRecommendations, deriveColorFamily } from "@/shared/catalog";
import { CatalogVisualCard } from "@/components/catalog/visual";
import { getDoorStyleImages, getFinishImages } from "@/shared/catalog/entityImages";
import { SectionHeader } from "@/components/marketing/SectionHeader";

interface RoomCatalogShowcaseProps {
  roomSlug: string;
  roomName: string;
  defaultCollectionId?: string;
}

export function RoomCatalogShowcase({
  roomSlug,
  roomName,
  defaultCollectionId,
}: RoomCatalogShowcaseProps) {
  const rec = getRecommendations({
    room: roomSlug,
    collection: defaultCollectionId,
  });

  const doors = rec.topDoorStyles.slice(0, 3);
  const finishes = rec.topFinishes.slice(0, 4);

  if (doors.length === 0 && finishes.length === 0) return null;

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Our catalog"
        title={
          <>
            Popular styles for {roomName.toLowerCase()}{" "}
            <em className="brc-accent text-accent">cabinets</em>
          </>
        }
        description="Door profiles and finishes from our catalog, the same library used in Design Studio and your client portal."
        align="left"
        className="mb-6"
      />

      {doors.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-6">
          {doors.map((door) => {
            const imgs = getDoorStyleImages(door.slug, door.imagePath);
            return (
              <CatalogVisualCard
                key={door.slug}
                name={door.name}
                description={door.description.slice(0, 120)}
                imageSrc={imgs.thumb640}
                imageAlt={`${door.name} door profile`}
                primaryHref={`/door-styles/${door.slug}`}
                primaryLabel="View door style"
              />
            );
          })}
        </div>
      )}

      {finishes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {finishes.map((finish) => {
            const imgs = getFinishImages(finish.slug, finish.imagePath);
            return (
              <CatalogVisualCard
                key={finish.slug}
                name={finish.name}
                imageSrc={imgs.swatch}
                imageAlt={`${finish.name} finish swatch`}
                specs={[
                  { label: "Color", value: deriveColorFamily(finish) },
                ]}
                primaryHref={`/finishes/${finish.category}/${finish.slug}`}
                primaryLabel="View finish"
                className="[&_h3]:text-base"
              />
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/door-styles" className="text-accent hover:underline underline-offset-2">
          All door styles
        </Link>
        <Link href="/finishes" className="text-accent hover:underline underline-offset-2">
          All finishes
        </Link>
        <Link href="/products" className="text-accent hover:underline underline-offset-2">
          Product catalog
        </Link>
        <Link href="/design-studio" className="text-accent hover:underline underline-offset-2">
          Design Studio
        </Link>
      </div>
    </div>
  );
}
