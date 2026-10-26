import Image from "next/image";

export interface PhotoBreakProps {
  src: string;
  alt: string;
  /** Optional short caption under the photo on mobile (and desktop when set). */
  caption?: string;
  /** Aspect ratio utility classes. Default favors phone scroll rhythm. */
  aspectClass?: string;
  /** Image sizes attribute. Defaults to full viewport width. */
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Full-bleed photography band for breaking text-heavy stretches, especially
 * on mobile. Prefer this over dumping a gallery at the end of a page: place
 * one break between content blocks so the scroll rhythm alternates copy and
 * picture.
 */
export function PhotoBreak({
  src,
  alt,
  caption,
  aspectClass = "aspect-[16/10] md:aspect-[21/9]",
  sizes = "100vw",
  priority = false,
  className,
}: PhotoBreakProps) {
  return (
    <figure className={["m-0 w-full", className].filter(Boolean).join(" ")}>
      <div className={`relative w-full overflow-hidden bg-muted ${aspectClass}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover img-brand-grade"
        />
      </div>
      {caption ? (
        <figcaption className="ed-shell pt-3 pb-1 text-sm text-muted-foreground leading-relaxed">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
