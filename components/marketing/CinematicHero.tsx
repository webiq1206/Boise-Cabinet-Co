import { InteriorHero } from '@/components/approved/InteriorLayout';
import Link from "next/link";

interface Crumb {
  name: string;
  href?: string;
}

interface CinematicHeroProps {
  image: string;
  alt: string;
  breadcrumbs: Crumb[];
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** CTAs and anything else that sits under the description. */
  children?: React.ReactNode;
}

/**
 * The approved family detail hero: paper-toned copy beside a large photograph.
 * The established component name and props remain compatible with catalog pages.
 */
export function CinematicHero({ image, alt, breadcrumbs, eyebrow, title, description, children }: CinematicHeroProps) {
  return (
    <InteriorHero imageSrc={image} imageAlt={alt} layout="split">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-inverse-muted">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={item.name} className="flex items-center gap-1.5">
                  {item.href && !isLast ? (
                    <Link href={item.href} className="tap-target transition-colors hover:text-inverse-foreground">{item.name}</Link>
                  ) : (
                    <span className={isLast ? "font-medium text-inverse-foreground/90" : ""}>{item.name}</span>
                  )}
                  {!isLast && <span aria-hidden="true">›</span>}
                </li>
              );
            })}
          </ol>
        </nav>
        {eyebrow && <p className="ed-eyebrow mt-8" style={{ color: "rgb(255 255 255 / 0.72)" }}>{eyebrow}</p>}
        <h1 className="ed-display ed-statement-display text-inverse-foreground">{title}</h1>
        {description && <p className="ed-lede mt-8 max-w-[44ch] text-inverse-foreground/85">{description}</p>}
        {children && <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 [&>*]:w-full sm:[&>*]:w-auto">{children}</div>}
      </InteriorHero>
  );
}
