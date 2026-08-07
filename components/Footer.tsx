import Link from "next/link";
import { SiteEmailLink } from "@/components/SiteEmailLink";
import { FOOTER_CABINET_LINKS } from "@/shared/cabinetNav";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { FooterCTAs } from "@/components/modals/FooterCTAs";
import { CONTENT_HUBS, guidePath } from "@/shared/contentHubs";
import { GUIDE_PAGES } from "@/shared/guideContent";
import { CITIES, locationPath } from "@/shared/contentData";

const PUBLISHED_GUIDE_SLUGS = new Set(GUIDE_PAGES.map((g) => g.slug));

interface FooterLink {
  label: string;
  href: string;
}

function buildFooterGroups(): { title: string; links: FooterLink[] }[] {
  const topHubLinks: FooterLink[] = CONTENT_HUBS.filter(
    (h) => h.priorityTier <= 2 && PUBLISHED_GUIDE_SLUGS.has(h.pillarSlug),
  )
    .slice(0, 3)
    .map((h) => ({ label: h.title, href: guidePath(h.pillarSlug) }));

  return [
    {
      title: "Services",
      links: [
        { label: "All Rooms", href: "/cabinets" },
        ...FOOTER_CABINET_LINKS,
        { label: "Full Catalog", href: "/catalog" },
        { label: "Shaker Cabinets", href: "/shaker-cabinets" },
        { label: "For Builders", href: "/builders" },
      ],
    },
    {
      title: "Projects, Process & Company",
      links: [
        { label: "Projects & Reviews", href: "/testimonials" },
        { label: "Why Choose Us", href: "/#why-choose-us" },
        { label: "How We Build", href: "/construction" },
        { label: "Warranty", href: "/warranty" },
        { label: "About", href: "/about" },
        { label: "My Project", href: "/portal" },
      ],
    },
    {
      title: "Costs & Resources",
      links: [
        { label: "Cabinet Guides", href: "/guides" },
        { label: "Planning Downloads", href: "/resources" },
        { label: "Blog", href: "/blog" },
        ...topHubLinks,
        { label: "Treasure Valley Overview", href: guidePath("treasure-valley-cabinet-guide") },
        { label: "Contact Us", href: "/contact" },
      ],
    },
  ];
}

function GroupLinks({ links }: { links: FooterLink[] }) {
  return (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const groups = buildFooterGroups();
  const sortedCities = [...CITIES].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <footer className="bg-inverse text-inverse-foreground">
      <div className="container px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_repeat(3,1fr)] gap-10 lg:gap-0 mb-10 lg:divide-x lg:divide-inverse-foreground/10 [&>*]:lg:px-8 [&>*:first-child]:lg:pl-0 [&>*:last-child]:lg:pr-0">
          {/* Brand & contact - always visible, never collapsed, above the accordions on mobile. */}
          <div>
            <Link href="/" className="mb-6 inline-block" aria-label="Boise Cabinet Co - home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/svg/wordmark-full/dark/boise-cabinet-co-wordmark-full-bone-accent.svg"
                alt="Boise Cabinet Co - Custom Cabinetry, Treasure Valley, Idaho"
                width={236}
                height={110}
                className="h-24 w-auto"
              />
            </Link>
            <div className="space-y-2 mb-6">
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
            <FooterCTAs />
          </div>

          {/* Desktop: plain columns. Mobile: accessible <details> accordions
              (native, keyboard-operable, no JS needed) instead of one long
              stacked list of every link at equal weight. */}
          {groups.map((group) => (
            <div key={group.title} className="border-t border-inverse-foreground/10 lg:border-t-0 lg:border-0">
              <details className="lg:hidden group/accordion py-1">
                <summary className="flex items-center justify-between cursor-pointer list-none py-4 font-sans font-medium text-[11px] tracking-[0.12em] uppercase text-inverse-muted min-h-11">
                  {group.title}
                  <span aria-hidden="true" className="transition-transform group-open/accordion:rotate-45 text-lg leading-none">
                    +
                  </span>
                </summary>
                <div className="pb-4">
                  <GroupLinks links={group.links} />
                </div>
              </details>
              <div className="hidden lg:block">
                <h2 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
                  {group.title}
                </h2>
                <GroupLinks links={group.links} />
              </div>
            </div>
          ))}
        </div>

        {/* Service areas - compact wrapped row rather than a tall vertical list. */}
        <div className="pb-8 mb-8 border-t border-b border-inverse-foreground/10 py-6">
          <h2 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-3 text-inverse-muted">
            Serving the Treasure Valley
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {sortedCities.map((city) => (
              <Link
                key={city.slug}
                href={locationPath(city.slug)}
                className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Utility row: legal, credentials, copyright - smaller weight than the primary groups above. */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-inverse-muted pt-5 border-t border-inverse-foreground/10">
          <div className="flex flex-wrap items-center gap-4">
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
