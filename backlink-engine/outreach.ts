/**
 * Outreach draft generation. Produces a personalized, non-spammy first-touch
 * message per opportunity category. Drafts are queued for one-tap human
 * approval before anything is sent (see README: the approval gate is what keeps
 * the footprint white-hat).
 */

import { SITE } from "./config";
import type { Opportunity } from "./types";

const SIGNOFF = `Best,\nThe ${SITE.name} team\n${SITE.domain} | ${SITE.phone}`;

export function draftOutreach(o: Opportunity): string {
  const site = SITE.name;
  switch (o.category) {
    case "curated-bestof":
      return `Subject: ${site} for your ${cityGuess(o.domain)} cabinet makers list

Hi,

I came across your roundup of top cabinet and kitchen pros and wanted to put ${site} on your radar. We build custom, frameless cabinetry in the Treasure Valley with a lifetime workmanship warranty and design-to-install under one roof.

Happy to share project photos, reviews, or anything you need to evaluate us for inclusion.

${SIGNOFF}`;
    case "resource-page":
      return `Subject: A resource for your page

Hi,

Your links/resources page is a genuinely useful list. We recently published a homeowner's guide to cabinet finishes and door styles that your readers may find valuable: https://${SITE.domain}/finishes

If it's a fit, we'd be grateful for a mention. Either way, thanks for maintaining the page.

${SIGNOFF}`;
    case "broken-link":
      return `Subject: Broken link on your page

Hi,

While reading your page I noticed a link that now 404s. If helpful, we have an up-to-date guide that covers the same topic and could serve as a replacement: https://${SITE.domain}/finishes

Thanks for the great resource.

${SIGNOFF}`;
    case "unlinked-mention":
      return `Subject: Quick thank-you (and a small ask)

Hi,

Thanks for mentioning ${site}. Would you be open to linking the mention to our site so readers can find us directly? Here's the URL: https://${SITE.domain}

Appreciate it either way.

${SIGNOFF}`;
    case "industry-association":
      return `Subject: Membership + directory listing

Hi,

${site} would like to join and be listed in your member directory. Could you point me to the application and the directory-profile setup?

${SIGNOFF}`;
    case "local-news":
      return `Subject: Local expert source on kitchen remodeling trends

Hi,

If you ever cover home improvement or local business, I'd be glad to be a Treasure Valley source on cabinet/kitchen trends, costs, and timelines. Happy to share data from real local projects.

${SIGNOFF}`;
    default:
      return `Subject: ${site}

Hi,

I'm reaching out from ${site}, a custom cabinet maker in the Treasure Valley. ${o.recommendedPlay}. Could you let me know the best way to proceed?

${SIGNOFF}`;
  }
}

function cityGuess(domain: string): string {
  const d = domain.toLowerCase();
  for (const c of SITE.serviceArea) if (d.includes(c.toLowerCase().replace(/\s/g, ""))) return c;
  return "local";
}
