import Image, { type ImageProps } from "next/image";

export interface SeoImageProps extends Omit<ImageProps, "alt"> {
  alt: string;
  title?: string;
  caption?: string;
  figcaptionClassName?: string;
}

/**
 * SEO-aware image wrapper with optional figcaption for accessibility and rich results.
 */
export function SeoImage({
  alt,
  title,
  caption,
  figcaptionClassName,
  className,
  ...props
}: SeoImageProps) {
  const image = (
    <Image
      alt={alt}
      title={title ?? alt}
      className={className}
      {...props}
    />
  );

  if (!caption) return image;

  return (
    <figure className="relative">
      {image}
      <figcaption
        className={
          figcaptionClassName ??
          "mt-2 text-sm text-muted-foreground leading-relaxed"
        }
      >
        {caption}
      </figcaption>
    </figure>
  );
}
