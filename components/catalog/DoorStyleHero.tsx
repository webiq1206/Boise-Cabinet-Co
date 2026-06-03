import Image from "next/image";
import { getDoorStyleBySlug } from "@/shared/catalog";
import { getDoorStyleImages } from "@/shared/catalog/entityImages";

interface DoorStyleHeroProps {
  slug: string;
  name: string;
  className?: string;
}

export function DoorStyleHero({ slug, name, className }: DoorStyleHeroProps) {
  const style = getDoorStyleBySlug(slug);
  const src =
    (style ? getDoorStyleImages(style).hero : undefined) ??
    `/images/catalog/door-styles/${slug}.webp`;

  return (
    <div className={`relative aspect-[16/9] overflow-hidden rounded-sm bg-muted ${className ?? ""}`}>
      <Image
        src={src}
        alt={`One Source ${name} cabinet door profile, Boise Cabinet Co`}
        title={`${name} Door Style | Boise Cabinet Co`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover img-brand-grade"
      />
    </div>
  );
}
