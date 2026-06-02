import Image from "next/image";
import { MARKETING_IMAGES } from "@/shared/siteImages";

interface CatalogPageHeroProps {
  src?: string;
  alt: string;
  title?: string;
}

export function CatalogPageHero({ src, alt, title }: CatalogPageHeroProps) {
  return (
    <div className="relative aspect-[21/9] max-h-[320px] overflow-hidden rounded-sm mb-8">
      <Image
        src={src ?? MARKETING_IMAGES.process}
        alt={alt}
        title={title ?? alt}
        fill
        sizes="100vw"
        className="object-cover img-brand-grade"
        priority
      />
    </div>
  );
}
