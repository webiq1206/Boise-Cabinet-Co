/**
 * P5 Home Co's public profiles: the family's only ones (owner answers,
 * 20 November 2026). Boise Cabinet Co has no profile of its own, so these
 * belong to the parent organization: its JSON-LD sameAs, the footer's parent
 * links, llms.txt and the "Reviews of our parent company" link.
 *
 * - Facebook: the vanity URL. The numeric page URL it replaced
 *   (facebook.com/1228704823655951) is the same page and redirects to it.
 * - Instagram: confirmed live by the owner; its bio names the five teams.
 * - Google Business Profile "P5 Home Co" (place ID ChIJzxMoavs6P6IRNc6i9aOvt6Q,
 *   Knowledge Graph id /g/11ntl1t7dc, Maps cid 11869148461693849141).
 *   The cid and the place id are the same listing.
 *
 * These four URLs are the parent Organization sameAs on every family site.
 * They never go on a brand node. Kept free of imports: lib/familyBrand.ts
 * ships to every page.
 */
export const P5_FACEBOOK_URL = 'https://www.facebook.com/p5homeco';
export const P5_INSTAGRAM_URL = 'https://www.instagram.com/p5_home_co';
export const P5_GOOGLE_BUSINESS_PROFILE_URL = 'https://www.google.com/search?kgmid=/g/11ntl1t7dc';
export const P5_MAPS_CID_URL = 'https://maps.google.com/?cid=11869148461693849141';

/** Parent Organization sameAs. Order is the family target list. Link only. */
export const P5_PARENT_SAME_AS = [
  P5_FACEBOOK_URL,
  P5_INSTAGRAM_URL,
  P5_GOOGLE_BUSINESS_PROFILE_URL,
  P5_MAPS_CID_URL,
] as const;
