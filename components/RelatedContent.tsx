import Link from "next/link";
import { ArrowRight, BookOpen, Leaf, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import manifest from "@/data/internal-links.json";

type PageType = "blog" | "service" | "city" | "city-service";

interface LinkEntry {
  url: string;
  anchor: string;
  title: string;
  type: PageType;
  score: number;
}

interface ManifestPage {
  type: PageType;
  title: string;
  anchor: string;
  url: string;
  links: LinkEntry[];
}

const PAGES = (manifest as { pages: Record<string, ManifestPage> }).pages;

interface RelatedContentProps {
  pageUrl: string;
  limit?: number;
  heading?: string;
  subheading?: string;
  variant?: "section" | "card";
  overrides?: LinkEntry[];
  sourceOverrides?: Array<{ url: string; anchor?: string }>;
  testIdPrefix?: string;
}

const ICONS: Record<PageType, typeof BookOpen> = {
  blog: BookOpen,
  service: Leaf,
  city: MapPin,
  "city-service": Sparkles,
};

function defaultHeading(type: PageType | undefined): string {
  switch (type) {
    case "blog":
      return "Related reading";
    case "service":
      return "Related services and guides";
    case "city":
      return "Explore more in your area";
    case "city-service":
      return "More for your neighborhood";
    default:
      return "You might also like";
  }
}

function resolveSourceOverrides(
  source: Array<{ url: string; anchor?: string }> | undefined,
): LinkEntry[] {
  if (!source || source.length === 0) return [];
  const resolved: LinkEntry[] = [];
  for (const ov of source) {
    const target = PAGES[ov.url];
    if (!target) continue;
    resolved.push({
      url: target.url,
      anchor: ov.anchor ?? target.anchor,
      title: target.title,
      type: target.type,
      score: 999,
    });
  }
  return resolved;
}

export function RelatedContent({
  pageUrl,
  limit,
  heading,
  subheading,
  variant = "section",
  overrides,
  sourceOverrides,
  testIdPrefix = "related",
}: RelatedContentProps) {
  const page = PAGES[pageUrl];
  const renderLimit = limit ?? (page?.type === "blog" ? 3 : 5);

  let pool: LinkEntry[];
  if (overrides && overrides.length > 0) {
    pool = overrides;
  } else {
    const resolvedSource = resolveSourceOverrides(sourceOverrides);
    const manifestLinks = page?.links ?? [];
    const seen = new Set(resolvedSource.map((l) => l.url));
    pool = [
      ...resolvedSource,
      ...manifestLinks.filter((l) => !seen.has(l.url)),
    ];
  }

  const links = pool.slice(0, renderLimit);

  if (links.length === 0) return null;

  const title = heading ?? defaultHeading(page?.type);

  if (variant === "card") {
    return (
      <Card data-testid={`${testIdPrefix}-card`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <ul className="space-y-3">
            {links.map((link) => (
              <li key={link.url}>
                <Link
                  href={link.url}
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 group transition-colors"
                  data-testid={`${testIdPrefix}-link-${link.url.replace(/\W+/g, "-")}`}
                >
                  <span className="line-clamp-2">{link.anchor}</span>
                  <ArrowRight className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30" data-testid={`${testIdPrefix}-section`}>
      <div className="container px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center space-y-2 md:space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
            {subheading && (
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {subheading}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {links.map((link) => {
              const Icon = ICONS[link.type] ?? Leaf;
              return (
                <Card key={link.url} className="hover-elevate" data-testid={`${testIdPrefix}-card-${link.url.replace(/\W+/g, "-")}`}>
                  <Link
                    href={link.url}
                    className="block"
                    data-testid={`${testIdPrefix}-link-${link.url.replace(/\W+/g, "-")}`}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold text-sm md:text-base line-clamp-2 text-primary">
                        {link.anchor}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        Visit page
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function getRelatedLinks(pageUrl: string, limit?: number): LinkEntry[] {
  const page = PAGES[pageUrl];
  if (!page) return [];
  return page.links.slice(0, limit ?? page.links.length);
}
