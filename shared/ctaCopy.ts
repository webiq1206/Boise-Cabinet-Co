/**
 * Sitewide conversion copy; each string matches its destination action.
 *
 * Two destinations, each with its own label (owner decision, 13 November 2026):
 *
 * 1. The instant estimate, the primary pricing call to action. It is the P5
 *    family's central estimator, framed at /instant-estimate. The header, the
 *    mobile menu and the bottom bar say "Instant estimate"; buttons inside a
 *    page say "Get an instant estimate". It gives a preliminary price range on
 *    screen, so it is never called a quote, a bid or a final price.
 * 2. "Request a quote" to /estimate, the request form a person answers. It is
 *    the secondary path wherever the instant estimate leads, and stays the
 *    primary on pages whose project the estimator cannot price.
 *    CTA_ESTIMATE is kept as an alias so existing imports cannot drift back to
 *    a third label.
 */
export const CTA_INSTANT_ESTIMATE = "Get an instant estimate";
/** The short form, for the header, the mobile menu and the bottom bar. */
export const CTA_INSTANT_ESTIMATE_SHORT = "Instant estimate";
export const INSTANT_ESTIMATE_HREF = "/instant-estimate";
export const CTA_REQUEST_QUOTE = "Request a quote";
export const CTA_ESTIMATE = CTA_REQUEST_QUOTE;
/** The quote request form: the path to a person. */
export const CTA_QUOTE_HREF = "/estimate";
/** Used only inside the estimator result step, where booking is the task's own next action. */
export const CTA_BOOK_VISIT = "Book a free design consult";
export const CTA_DESIGN_STUDIO = "Browse the catalog";
export const CTA_EXPLORE_COLLECTIONS = "Explore collections";
export const CTA_BROWSE_CABINETS = "Browse cabinets";
export const CTA_PORTAL_SHORT = "My Project";
export const CTA_SAVE_CONTACT = "Save our contact";
