import Link from "next/link";
import { FOOTER_CABINET_LINKS } from "@/shared/cabinetNav";
import { SITE_TAGLINE } from "@/shared/siteContent";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { FooterCTAs } from "@/components/modals/FooterCTAs";
import { CONTENT_HUBS, categoryHubPath, guidePath } from "@/shared/contentHubs";
import { BLOG_POSTS } from "@/shared/blogContent";
import { GUIDE_PAGES } from "@/shared/guideContent";
import manifest from "@/data/internal-links.json";

const PUBLISHED_GUIDE_SLUGS = new Set(GUIDE_PAGES.map((g) => g.slug));

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-inverse text-inverse-foreground">
      <div className="container px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-10 mb-12 lg:gap-0 lg:divide-x lg:divide-inverse-foreground/10 [&>*]:lg:px-6 [&>*:first-child]:lg:pl-0 [&>*:last-child]:lg:pr-0">
          <div>
            <div className="mb-4">
              <span className="font-sans font-light text-lg tracking-tight text-inverse-foreground">
                Boise <em className="brc-accent text-accent">Cabinet</em> Co
              </span>
            </div>
            <p className="text-sm mb-6 text-inverse-muted font-sans">
              {SITE_TAGLINE}.
            </p>
            <div className="space-y-2">
              <a
                href={SITE_CONFIG.phoneHref}
                className="block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                {SITE_CONFIG.phone}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                {SITE_CONFIG.email}
              </a>
              <p className="text-sm text-inverse-muted">
                Boise, Idaho · Treasure Valley
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
              Cabinets
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/cabinets" className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors">
                  All Rooms
                </Link>
              </li>
              {FOOTER_CABINET_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Full catalog", href: "/catalog" },
                { label: "Finishes", href: "/finishes" },
                { label: "Door Styles", href: "/door-styles" },
                { label: "Design Studio", href: "/design-studio" },
                { label: "My Project", href: "/portal" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
              Resources
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/guides"
                  className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                >
                  Cabinet Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                >
                  Planning Downloads
                </Link>
              </li>
              {CONTENT_HUBS.filter(
                (h) => h.priorityTier <= 2 && PUBLISHED_GUIDE_SLUGS.has(h.pillarSlug),
              )
                .slice(0, 3)
                .map((hub) => (
                  <li key={hub.hubSlug}>
                    <Link
                      href={guidePath(hub.pillarSlug)}
                      className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                    >
                      {hub.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
              Studio
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "About", href: "/about" },
                { label: "Projects & Reviews", href: "/testimonials" },
                { label: "Contact", href: "/contact" },
                { label: "Why Choose Us", href: "/#why-choose-us" },
                { label: "How We Build", href: "/construction" },
                { label: "Warranty", href: "/warranty" },
                { label: "Blog", href: "/blog" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
              From the Blog
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                >
                  All articles
                </Link>
              </li>
              {CONTENT_HUBS.filter((h) => h.priorityTier <= 2)
                .slice(0, 3)
                .map((hub) => (
                  <li key={hub.hubSlug}>
                    <Link
                      href={categoryHubPath(hub.hubSlug)}
                      className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                    >
                      {hub.title}
                    </Link>
                  </li>
                ))}
              {(
                (manifest.blogByCategory as Record<
                  string,
                  Array<{ slug: string; title: string }>
                >)?.['cabinet-costs'] ??
                BLOG_POSTS.filter((p) => p.hubSlug === 'cabinet-costs')
                  .slice(0, 1)
                  .map((p) => ({ slug: p.slug, title: p.title }))
              )
                .slice(0, 1)
                .map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors line-clamp-2"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
              Start a Conversation
            </h3>
            <ul className="space-y-2.5">
              <FooterCTAs />
              {[
                { label: SITE_CONFIG.phone, href: SITE_CONFIG.phoneHref },
                { label: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-inverse-foreground/10">
              <a
                href="/partner"
                className="text-xs text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                Partner Login
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-inverse-muted pt-5 border-t border-inverse-foreground/10">
          <div className="flex flex-wrap gap-4">
            <span>&copy; {currentYear} {SITE_CONFIG.name}. All rights reserved.</span>
            <span>License details available upon request</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="transition-colors hover:text-inverse-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="transition-colors hover:text-inverse-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
