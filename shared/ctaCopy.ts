/**
 * Sitewide conversion copy; each string matches its destination action.
 * One primary label and one destination site-wide: "Request a quote" to /estimate
 * (family plan Phase 1). CTA_ESTIMATE is kept as an alias so existing imports
 * cannot drift back to a second label.
 */
export const CTA_REQUEST_QUOTE = "Request a quote";
export const CTA_ESTIMATE = CTA_REQUEST_QUOTE;
/** The one destination every primary quote CTA points at. */
export const CTA_QUOTE_HREF = "/estimate";
/** Used only inside the estimator result step, where booking is the task's own next action. */
export const CTA_BOOK_VISIT = "Book a free design consult";
export const CTA_DESIGN_STUDIO = "Browse the catalog";
export const CTA_EXPLORE_COLLECTIONS = "Explore collections";
export const CTA_BROWSE_CABINETS = "Browse cabinets";
export const CTA_PORTAL_SHORT = "My Project";
export const CTA_SAVE_CONTACT = "Save our contact";
