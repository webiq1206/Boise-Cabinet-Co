import Link from "next/link";
import { DOOR_STYLES, FINISHES, deriveColorFamily } from "@/shared/catalog";
import { CatalogVisualCard } from "@/components/catalog/visual";
import { getDoorStyleImages, getFinishImages } from "@/shared/catalog/entityImages";

const FEATURED_DOOR_SLUGS = [
  "modern-shaker",
  "slab",
  "thin-shaker",
] as const;

const FEATURED_FINISH_SLUGS = [
  "matte-vanilla-orchid",
  "woodgrain-canyon-oak",
  "gloss-white-hg",
  "matte-eucalyptus",
] as const;

export function CatalogExploreStrip() {
  const doors = FEATURED_DOOR_SLUGS.map((slug) => DOOR_STYLES.find((d) => d.slug === slug)).filter(
    Boolean,
  );
  const finishes = FEATURED_FINISH_SLUGS.map((slug) => FINISHES.find((f) => f.slug === slug)).filter(
    Boolean,
  );

  return (
    <div className="my-10 space-y-8 rounded-xl border bg-card p-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Product catalog</p>
        <h3 className="text-lg font-serif tracking-tight">
          Explore door styles &amp; finishes
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Six door profiles and 299 finishes - browse the full library or open Design Studio.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {doors.map((door) => {
          if (!door) return null;
          const imgs = getDoorStyleImages(door.slug, door.imagePath);
          return (
            <CatalogVisualCard
              key={door.slug}
              name={door.name}
              imageSrc={imgs.thumb640}
              imageAlt={`${door.name} door profile`}
              primaryHref="/catalog"
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {finishes.map((finish) => {
          if (!finish) return null;
          const imgs = getFinishImages(finish.slug, finish.imagePath);
          return (
            <CatalogVisualCard
              key={finish.slug}
              name={finish.name}
              imageSrc={imgs.swatch}
              imageAlt={`${finish.name} finish swatch`}
              fallbackColor={finish.hexColor}
              specs={[{ label: "Color", value: deriveColorFamily(finish) }]}
              primaryHref="/catalog"
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/catalog" className="tap-target text-accent hover:underline underline-offset-2">
          All door styles
        </Link>
        <Link href="/catalog" className="tap-target text-accent hover:underline underline-offset-2">
          All finishes
        </Link>
        <Link href="/estimate" className="tap-target text-accent hover:underline underline-offset-2">
          Get an estimate
        </Link>
      </div>
    </div>
  );
}
