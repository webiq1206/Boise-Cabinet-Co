import Image from "next/image";
import { DOOR_STYLE_MAP } from "@/shared/supplier/productColorMap";

interface DoorStyleHeroProps {
  slug: string;
  name: string;
  className?: string;
}

export function DoorStyleHero({ slug, name, className }: DoorStyleHeroProps) {
  const mapping = DOOR_STYLE_MAP.find((d) => d.brcSlug === slug);
  const src = mapping?.imagePath ?? `/images/catalog/door-styles/${slug}.webp`;

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
