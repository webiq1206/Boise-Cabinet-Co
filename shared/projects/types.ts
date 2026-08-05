/**
 * Project data model shared by the marketing gallery, homepage feature, case
 * studies, testimonials schema, and image sitemap.
 *
 * A project is authored once in `data/projects.json` (or a per-project folder at
 * `public/images/projects/<slug>/project.json`) and compiled by
 * `scripts/projects/build-projects.mjs` into `shared/generated/projects.generated.ts`.
 * The generator applies the credibility rules below automatically, so no site
 * component ever needs hand-editing to add or change a project.
 *
 * CREDIBILITY RULES (enforced by the generator, not by trust):
 * - `kind: "concept"`  -> an illustrative design rendering. Rendered as a single
 *   completed-look image with a "Design concept" label and disclosure. A
 *   before/after slider is never shown for a concept, even if a "before" image
 *   is supplied.
 * - `kind: "verified"` -> a documented, real completed installation. A
 *   before/after slider is shown ONLY when a real `before` image exists, it is
 *   flagged `sameSpaceBeforeAfter: true`, and its aspect ratio matches the
 *   `after` image within tolerance. Otherwise the completed image is shown alone.
 */

export type ProjectKind = "concept" | "verified";

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface ProjectScenarioDetail {
  label: string;
  value: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectScenario {
  /** One-line scope summary shown under the title. */
  scope: string;
  challenge: string;
  approach: string;
  outcome: string;
  details: ProjectScenarioDetail[];
  links: ProjectLink[];
}

export interface SiteProject {
  slug: string;
  kind: ProjectKind;
  serviceType: string;
  /** Treasure Valley area for local relevance. */
  area: string;
  title: string;
  description: string;
  /** Completed-look image (required). */
  hero: ProjectImage;
  /**
   * Real same-space "before" image. Present ONLY when the generator has cleared
   * it for a before/after comparison (verified + same space + matching aspect).
   */
  before?: ProjectImage;
  /** Additional detail/lifestyle images. */
  detail: ProjectImage[];
  /**
   * Computed by the generator. When true, render a before/after slider using
   * `hero` (after) and `before`. When false, render `hero` alone.
   */
  showBeforeAfter: boolean;
  /** Optional narrative for the case-studies section. */
  scenario?: ProjectScenario;
}
