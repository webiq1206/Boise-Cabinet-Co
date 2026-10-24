import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DoorStyle, Finish } from "@/shared/catalog";
import { finishAlt, getDoorStyleImages, getFinishesForDoorStyle } from "@/shared/catalog";
import { FinishSwatch } from "@/components/catalog/FinishSwatchGrid";

/**
 * Compact catalog reference for use inside an article. The full explorers
 * (door hero, availability strip, action bar, swatch grid) were built for the
 * catalog pages; dropped into a 690px article column they squeezed finish cards
 * to 75px and ran four screens long on phones (BCC-19). This keeps the useful
 * part: what it looks like, which finishes it comes in, and where to see more.
 */
function Swatches({ finishes }: { finishes: Finish[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Example finishes">
      {finishes.map((f) => (
        <li key={f.slug} className="w-9" title={f.name}>
          <FinishSwatch finish={f} />
        </li>
      ))}
    </ul>
  );
}

export function DoorStyleStrip({ style }: { style: DoorStyle }) {
  const all = getFinishesForDoorStyle(style.slug);
  const src = getDoorStyleImages(style.slug, style.imagePath).primary ?? `/images/catalog/door-styles/${style.slug}.webp`;
  return (
    <aside className="article-catalog-strip not-prose my-10 grid gap-5 border-y border-border py-6 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
      <div className="relative aspect-[4/5] w-32 sm:w-40 bg-[#f1ede4]">
        <Image
          src={src}
          alt={`${style.name} cabinet door, Boise Cabinet Co`}
          fill
          sizes="160px"
          className="object-contain p-3"
        />
      </div>
      <div className="min-w-0 space-y-3">
        <p className="ed-eyebrow">Door style</p>
        <h3 className="font-serif text-2xl leading-tight">{style.name}</h3>
        <p className="text-base text-muted-foreground line-clamp-3">{style.description}</p>
        {all.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Available in {all.length} finishes, including:</p>
            <Swatches finishes={all.slice(0, 8)} />
          </div>
        )}
        <Link href="/catalog" className="tap-target inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
          Browse door styles and finishes <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}

export function FinishStrip({ finish }: { finish: Finish }) {
  return (
    <aside className="article-catalog-strip not-prose my-10 grid gap-5 border-y border-border py-6 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
      <div className="w-24 sm:w-28" aria-label={finishAlt(finish)}>
        <FinishSwatch finish={finish} />
      </div>
      <div className="min-w-0 space-y-3">
        <p className="ed-eyebrow">Finish</p>
        <h3 className="font-serif text-2xl leading-tight">{finish.name}</h3>
        {finish.description && <p className="text-base text-muted-foreground line-clamp-3">{finish.description}</p>}
        <Link href="/catalog" className="tap-target inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
          See it with every door style <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
