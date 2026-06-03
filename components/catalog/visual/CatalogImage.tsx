import Image from "next/image";
import { cn } from "@/lib/utils";

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
        className={cn("object-cover img-brand-grade", imageClassName)}
      />
    </div>
  );
}
