import Image from "next/image";
import Link from "next/link";
import { GRAIN_URL } from "@/lib/grain";

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
 * The family hero: a full-bleed photograph, the copy anchored bottom-left on
 * a gradient, breadcrumbs above the eyebrow. The catalogue pages used to open
 * with a text-only column beside empty space; every page now opens the same
 * way the home and about pages do.
 */
export function CinematicHero({ image, alt, breadcrumbs, eyebrow, title, description, children }: CinematicHeroProps) {
  return (
    <section className="relative flex min-h-[clamp(480px,64vh,720px)] items-end overflow-hidden bg-inverse" data-contrast-skip>
      <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover opacity-[0.85] img-brand-grade" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-inverse/85 via-inverse/50 to-inverse/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-inverse/55 via-inverse/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-inverse/50 via-inverse/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: GRAIN_URL, backgroundRepeat: "repeat", opacity: 0.03 }} />
      <div className="ed-shell relative z-10 w-full pb-[clamp(48px,6vw,88px)] pt-10 fade-up">
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
      </div>
    </section>
  );
}
