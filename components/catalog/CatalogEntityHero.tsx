import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CatalogEntityHeroProps {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CatalogEntityHero({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  children,
  className,
}: CatalogEntityHeroProps) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2 md:items-start", className)}>
      {imageSrc && (
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            priority
            className="object-cover img-brand-grade"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
