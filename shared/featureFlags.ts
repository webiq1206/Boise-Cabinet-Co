/**
 * Site-wide feature flags.
 *
 * Toggle work-in-progress surfaces without ripping out their code. Flags read
 * from public env so they can differ per environment (e.g. enabled locally,
 * hidden in production).
 */

/**
 * Design Studio is hidden from the public site while it is being rebuilt.
 * When disabled: the /design-studio route 404s, it is removed from navigation,
 * footer, CTAs, sitemap, and search indexing, and internal links point at the
 * estimate flow instead. Set NEXT_PUBLIC_DESIGN_STUDIO_ENABLED=true (e.g. in
 * .env.local) to work on it locally.
 */
export const DESIGN_STUDIO_ENABLED =
  process.env.NEXT_PUBLIC_DESIGN_STUDIO_ENABLED === "true";
