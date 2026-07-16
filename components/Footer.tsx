import Link from "next/link";
import { SiteEmailLink } from "@/components/SiteEmailLink";
import { FOOTER_CABINET_LINKS } from "@/shared/cabinetNav";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-10 mb-12 lg:gap-0 lg:divide-x lg:divide-inverse-foreground/10 [&>*]:lg:px-6 [&>*:first-child]:lg:pl-0 [&>*:last-child]:lg:pr-0">
          <div>
            <Link href="/" className="mb-6 inline-block" aria-label="Boise Cabinet Co — home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/boise-cabinet-co-logo-primary-reverse.svg"
                alt="Boise Cabinet Co — Custom Cabinetry, Treasure Valley, Idaho"
                width={236}
                height={80}
                className="h-16 w-auto"
              />
            </Link>
            <div className="space-y-2">
              <a
                href={SITE_CONFIG.phoneHref}
                className="block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                Call {SITE_CONFIG.phone}
              </a>
              <a
                href={SITE_CONFIG.phoneSmsHref}
                className="block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                Text {SITE_CONFIG.phone}
              </a>
              <SiteEmailLink className="block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors text-left bg-transparent border-0 p-0 cursor-pointer font-inherit" />
              <address className="not-italic text-sm text-inverse-muted">
                {SITE_CONFIG.address.city}, {SITE_CONFIG.address.state}
              </address>
              <p className="text-sm text-inverse-muted">
                Serving Boise &amp; the Treasure Valley
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
                { label: "Shaker Cabinets", href: "/shaker-cabinets" },
                { label: "For Builders", href: "/builders" },
                { label: "Get an Estimate", href: "/estimate" },
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
              Service Areas
            </h3>
            <ul className="space-y-2.5">
              {GUIDE_PAGES.filter((g) => g.guideType === "location")
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((guide) => (
                  <li key={guide.slug}>
                    <Link
                      href={guidePath(guide.slug)}
                      className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                    >
                      {guide.title.replace(" Custom Cabinet Guide", "")}
                    </Link>
                  </li>
                ))}
              <li>
                <Link
                  href={guidePath("treasure-valley-cabinet-guide")}
                  className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                >
                  Treasure Valley overview
                </Link>
              </li>
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
                { label: `Call ${SITE_CONFIG.phone}`, href: SITE_CONFIG.phoneHref },
                { label: `Text ${SITE_CONFIG.phone}`, href: SITE_CONFIG.phoneSmsHref },
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
              <li>
                <SiteEmailLink className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors text-left bg-transparent border-0 p-0 cursor-pointer font-inherit" />
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-inverse-muted pt-5 border-t border-inverse-foreground/10">
          <div className="flex flex-wrap items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/boise-cabinet-co-seal-dark.svg"
              alt="Boise Cabinet Co seal"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full"
            />
            <span>&copy; {currentYear} {SITE_CONFIG.name}. All rights reserved.</span>
            <span>
              {SITE_CONFIG.trust.licenseNumber
                ? `Idaho license #${SITE_CONFIG.trust.licenseNumber}`
                : "License details available upon request"}
            </span>
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
