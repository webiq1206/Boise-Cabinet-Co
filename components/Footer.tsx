
import { ApprovedBrand } from "@/components/approved/ApprovedBrand";
import { FooterCTAs } from "@/components/modals/FooterCTAs";
import { SaveContactLink } from "@/components/SaveContactLink";
import { FOOTER_CABINET_LINKS } from "@/shared/cabinetNav";
import { CITIES,locationPath } from "@/shared/contentData";
import { CONTENT_HUBS,guidePath } from "@/shared/contentHubs";
import { GUIDE_PAGES } from "@/shared/guideContent";
import { IDAHO_REGISTERED_CONTRACTOR, PUBLIC_HOURS_LINE } from "@/shared/claims";
import { SITE_CONFIG } from "@/shared/siteConfig";
import Link from "next/link";

const PUBLISHED_GUIDE_SLUGS = new Set(GUIDE_PAGES.map((g) => g.slug));

interface FooterLink {
  label: string;
  href: string;
}

function buildFooterGroups(reviewLink: FooterLink | null): { title: string; links: FooterLink[] }[] {
  const topHubLinks: FooterLink[] = CONTENT_HUBS.filter(
    (h) => h.priorityTier <= 2 && PUBLISHED_GUIDE_SLUGS.has(h.pillarSlug),
  )
    .slice(0, 3)
    .map((h) => ({ label: h.title, href: guidePath(h.pillarSlug) }));

  return [
    {
      // Six rooms, not twelve: the full room list lives in the Shop by Room
      // menu on every page and on /cabinets, so the footer names the rooms
      // people ask for most and the catalogue entry points.
      title: "Services",
      links: [
        { label: "All Rooms", href: "/cabinets" },
        ...FOOTER_CABINET_LINKS.slice(0, 6),
        { label: "Cabinet Installation", href: "/services/cabinet-installation" },
        { label: "Full Catalog", href: "/catalog" },
        { label: "Shaker Cabinets", href: "/shaker-cabinets" },
        { label: "For Builders", href: "/builders" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        ...(reviewLink ? [reviewLink] : [{ label: "Design ideas", href: "/design-ideas" }]),
        { label: "Why Choose Us", href: "/#why-us" },
        { label: "How We Work", href: "/construction" },
        { label: "Warranty", href: "/warranty" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Cabinet Guides", href: "/guides" },
        { label: "Planning Downloads", href: "/resources" },
        { label: "Blog", href: "/blog" },
        ...topHubLinks,
        { label: "Treasure Valley Overview", href: guidePath("treasure-valley-cabinet-guide") },
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
            rel={link.href.startsWith("/portal") ? "nofollow" : undefined}
            className="tap-target text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer({ reviewLink = null }: { reviewLink?: FooterLink | null }) {
  const currentYear = new Date().getFullYear();
  const groups = buildFooterGroups(reviewLink);
  const sortedCities = [...CITIES].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <footer className="site-footer bg-inverse text-inverse-foreground">
      <div className="container px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_repeat(3,1fr)] gap-10 lg:gap-0 mb-10 lg:divide-x lg:divide-inverse-foreground/10 [&>*]:lg:px-8 [&>*:first-child]:lg:pl-0 [&>*:last-child]:lg:pr-0">
          {/* Brand & contact - always visible, never collapsed, above the accordions on mobile. */}
          <div>
            <Link href="/" className="mb-6 inline-block" aria-label="Boise Cabinet Co - home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <ApprovedBrand />
            </Link>
            {/* A column, so the Call and Text links never share a line on touch
                devices, where tap targets become inline-flex. (BCC-05) */}
            <div className="mb-6 flex flex-col items-start gap-2">
              <a
                href={SITE_CONFIG.phoneHref}
                className="tap-target block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                Call {SITE_CONFIG.phone}
              </a>
              <a
                href={SITE_CONFIG.phoneSmsHref}
                className="tap-target block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                Text {SITE_CONFIG.phone}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="tap-target block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                {SITE_CONFIG.email}
              </a>
              <p className="text-sm text-inverse-muted">
                Public representative: Nick Perkins · 4031 W Wapoot St, Meridian, ID 83646 · Service-area business, not a staffed storefront
              </p>
              <address className="not-italic text-sm text-inverse-muted">
                {SITE_CONFIG.address.city}, {SITE_CONFIG.address.state}
              </address>
              <p className="text-sm text-inverse-muted">
                Serving Boise &amp; the Treasure Valley
              </p>
              <p className="text-sm text-inverse-muted">{PUBLIC_HOURS_LINE}</p>
              <SaveContactLink
                showIcon
                className="tap-target mt-1 text-sm text-inverse-muted underline underline-offset-2 transition-colors hover:text-inverse-foreground"
              />
            </div>
            <FooterCTAs />
          </div>

          {/* Desktop: plain columns. Mobile: accessible <details> accordions
              (native, keyboard-operable, no JS needed) instead of one long
              stacked list of every link at equal weight. */}
          {groups.map((group) => (
            <div key={group.title} className="border-t border-inverse-foreground/10 lg:border-t-0 lg:border-0">
              <details className="lg:hidden group/accordion py-1">
                <summary className="flex items-center justify-between cursor-pointer list-none py-4 font-sans font-medium text-[12px] tracking-[0.12em] uppercase text-inverse-muted min-h-11">
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
                <h2 className="font-serif font-medium text-[12px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
                  {group.title}
                </h2>
                <GroupLinks links={group.links} />
              </div>
            </div>
          ))}
        </div>

        {/* Service areas - compact wrapped row rather than a tall vertical list. */}
        <div className="border-t border-inverse-foreground/10 py-6">
          <h2 className="font-serif font-medium text-[12px] tracking-[0.12em] uppercase mb-3 text-inverse-muted">
            Serving the Treasure Valley
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {sortedCities.map((city) => (
              <Link
                key={city.slug}
                href={locationPath(city.slug)}
                className="tap-target text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-inverse-muted border-b border-inverse-foreground/10 pb-6 mb-2">
          Part of{" "}
          <a href="https://p5homeco.com" className="underline underline-offset-2 transition-colors hover:text-inverse-foreground">
            P5 Home Co
          </a>
          :{" "}
          <a href="https://boiseconstruction.co" className="underline underline-offset-2 transition-colors hover:text-inverse-foreground">Boise Construction Co</a>
          {" · "}
          <a href="https://boiseremodeling.co" className="underline underline-offset-2 transition-colors hover:text-inverse-foreground">Boise Remodeling Co</a>
          {" · "}
          <a href="https://boisehandyman.co" className="underline underline-offset-2 transition-colors hover:text-inverse-foreground">Boise Handyman Co</a>
          {" · "}
          <a href="https://boisecabinet.co" className="underline underline-offset-2 transition-colors hover:text-inverse-foreground">Boise Cabinet Co</a>
          {" · "}
          <a href="https://boiseconstruction.co" className="underline underline-offset-2 transition-colors hover:text-inverse-foreground">Boise ADU Co</a>
          {" "}
          (projects currently run through Boise Construction Co; site coming)
        </p>

        {/* Utility row: legal, credentials, copyright - smaller weight than the primary groups above. */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-inverse-muted pt-5 border-t border-inverse-foreground/10">
          <div className="flex flex-wrap items-center gap-4">
            <span>&copy; {currentYear} {SITE_CONFIG.name}. All rights reserved.</span>
            <span className="whitespace-normal">
              <a
                href="https://edopl.idaho.gov/OnlineServices/?link=PubSearch"
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target underline underline-offset-2 transition-colors hover:text-inverse-foreground"
                title="Look up registration 8381215 on Idaho DOPL"
                aria-label="Verify with Idaho DOPL: look up registration 8381215, opens in a new tab"
              >
                {IDAHO_REGISTERED_CONTRACTOR}
              </a>
            </span>
            {/* Required parent-company disclosure. This brand is a DBA of
                P5 Home Co LLC, not a separate company, and the branded link
                gives that claim somewhere to resolve - for a reader deciding
                who signs the contract, and for the entity graph, which
                declares the same relationship in JSON-LD. */}
            <span>
              {SITE_CONFIG.name} is a DBA of{" "}
              <a
                href="https://p5homeco.com"
                className="tap-target inline-flex items-center underline underline-offset-2 transition-colors hover:text-inverse-foreground"
              >
                P5 Home Co LLC
              </a>
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/sitemap" className="tap-target inline-flex items-center transition-colors hover:text-inverse-foreground">
              Site Map
            </Link>
            <Link href="/privacy-policy" className="tap-target inline-flex items-center transition-colors hover:text-inverse-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="tap-target inline-flex items-center transition-colors hover:text-inverse-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
