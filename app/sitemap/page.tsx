import { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { buildCanonical } from "@/lib/page-metadata";
import { getSiteUrlGroups } from "@/lib/siteUrls";

const DESCRIPTION = `Every page on the ${SITE_CONFIG.name} website in one place: cabinets by room, service areas, guides, and articles.`;

export const metadata: Metadata = {
  title: { absolute: `Site Map | ${SITE_CONFIG.name}` },
  description: DESCRIPTION,
  alternates: { canonical: buildCanonical("/sitemap") },
  openGraph: {
    title: `Site Map | ${SITE_CONFIG.name}`, description: DESCRIPTION, url: buildCanonical("/sitemap"), type: "website",
    siteName: SITE_CONFIG.name, locale: "en_US",
    images: [{ url: "/images/marketing/og-default.png", width: 1200, height: 630, alt: `${SITE_CONFIG.name} custom cabinets` }],
  },
  twitter: { card: "summary_large_image", title: `Site Map | ${SITE_CONFIG.name}`, description: DESCRIPTION, images: ["/images/marketing/og-default.png"] },
};

/**
 * The HTML sitemap: a page of real followed links, so every public URL is
 * reachable from the footer in two clicks. Renders the same list as sitemap.xml.
 */
export default function SitemapPage() {
  const groups = getSiteUrlGroups();
  const breadcrumbSchema = generateBreadcrumbSchema([{ name: "Home", url: "/" }, { name: "Site Map", url: "/sitemap" }]);
  const webPageSchema = generateWebPageSchema({ title: "Site Map", description: DESCRIPTION, url: "/sitemap" });
  const id = (h: string) => `sitemap-${h.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto blog-content prose-measure">
            <h1>Site Map</h1>
            <p className="lead text-muted-foreground">{DESCRIPTION}</p>
            {groups.map((g) => g.entries.length === 0 ? null : (
              <section key={g.heading} aria-labelledby={id(g.heading)}>
                <h2 id={id(g.heading)}>{g.heading} <span className="text-muted-foreground text-base font-normal">({g.entries.length})</span></h2>
                <ul>{g.entries.map((e) => <li key={e.path}><Link href={e.path}>{e.label}</Link></li>)}</ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
