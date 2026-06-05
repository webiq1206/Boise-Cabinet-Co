import Image from "next/image";
import { cn } from "@/lib/utils";
import { getBlurDataURL } from "@/shared/generated/imageBlur";

export interface CatalogImageProps {
  src: string;
  alt: string;
  /** CSS aspect-ratio value, e.g. "4/3", "1/1", "16/9" */
  aspectRatio?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
}

export function CatalogImage({
  src,
  alt,
  aspectRatio = "4/3",
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
}: CatalogImageProps) {
  // Priority/hero images render real pixels immediately (no blur). Everything
  // else gets an instant LQIP placeholder while the static variant loads.
  const blurDataURL = priority ? undefined : getBlurDataURL(src);

  return (
    <div
      className={cn("relative overflow-hidden rounded-sm bg-muted", className)}
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder={blurDataURL ? "blur" : undefined}
        blurDataURL={blurDataURL}
        className={cn("object-cover img-brand-grade", imageClassName)}
      />
    </div>
  );
}
