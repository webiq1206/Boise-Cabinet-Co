"use client";

import { SiteFooter } from "@/components/family/SiteFooter";
import { FooterCTAs } from "@/components/modals/FooterCTAs";
import { FAMILY_BRAND } from "@/lib/familyBrand";
import { usePathname } from "next/navigation";

/**
 * Boise Cabinet Co footer: the shared family SiteFooter, set up by
 * lib/familyBrand.ts. Everything this site's footer carried is there: all rooms
 * and the six most-asked rooms, installation, the full catalog, shaker cabinets
 * and builders; about, design ideas (or projects and reviews while they show),
 * why choose us, how we work, warranty and contact; the guides, planning
 * downloads, blog, the three pillar guides and the Treasure Valley overview;
 * every service area; call, text and email; Save our contact; the public NAP
 * line with hours; the DOPL-linked registration line; the DBA disclosure; the
 * legal links; P5 Home Co's Facebook page and Google profile (owner call A:
 * wherever the Facebook page is linked); and the P5 Home Co family row.
 *
 * The brand column keeps the footer's "Request a quote" link with its
 * primary_cta_clicked event. The family header has no slot for the signed-in
 * customer's project link the old header showed, so the portal entry lives
 * here for every visitor; /portal handles sign-in.
 */
export function Footer({ hideRegistration }: { hideRegistration?: boolean } = {}) {
  const pathname = usePathname();
  return (
    <SiteFooter
      hideRegistration={hideRegistration === true || pathname === "/kitchen-cabinets"}
      brandExtra={
        <ul className="fam-footer-contact">
          <li>
            <a href="/portal" data-testid="link-footer-portal">
              Customer project portal
            </a>
          </li>
          <li>
            <FooterCTAs label={FAMILY_BRAND.cta.label} href={FAMILY_BRAND.cta.href} />
          </li>
        </ul>
      }
    />
  );
}
