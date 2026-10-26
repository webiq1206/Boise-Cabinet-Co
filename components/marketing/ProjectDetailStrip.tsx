import Image from "next/image";
import type { ProjectImage } from "@/shared/projects/types";

export interface ProjectDetailStripProps {
  images: ProjectImage[];
  /** Optional label above the strip. */
  label?: string;
  className?: string;
}

/**
 * Horizontal strip of same-property detail photos. Used under a featured
 * project hero or beside case-study copy so exterior, kitchen, bath, and
 * built-ins read as one cohesive property set.
 */
export function ProjectDetailStrip({
  images,
  label,
  className,
}: ProjectDetailStripProps) {
  if (!images.length) return null;

  return (
    <div className={className}>
      {label ? (
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">
          {label}
        </p>
      ) : null}
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3">
        {images.map((image) => (
          <li key={image.src} className="relative aspect-[4/3] overflow-hidden bg-muted">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover img-brand-grade"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
