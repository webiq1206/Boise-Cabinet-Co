/**
 * Marketing gallery data, derived from the compiled project source of truth.
 *
 * Authoring happens in `data/projects.json` (or per-project folders under
 * `public/images/projects/<slug>/`); `npm run projects:build` compiles it into
 * `shared/generated/projects.generated.ts` with the credibility rules applied.
 * Nothing here is hand-maintained per project.
 */
import { PROJECTS } from "./generated/projects.generated";
import type { SiteProject } from "./projects/types";

export type { SiteProject } from "./projects/types";
export { PROJECTS } from "./generated/projects.generated";

/** Back-compat flat shape for simpler consumers (JSON-LD, image sitemap, API). */
export interface DesignConcept {
  serviceType: string;
  area: string;
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
}

export const GALLERY_PROJECTS: DesignConcept[] = PROJECTS.map((p: SiteProject) => ({
  serviceType: p.serviceType,
  area: p.area,
  imageUrl: p.hero.src,
  imageAlt: p.hero.alt,
  title: p.title,
  description: p.description,
}));

/** True when at least one entry is an illustrative concept (drives disclosures). */
export const GALLERY_HAS_CONCEPT = PROJECTS.some((p) => p.kind === "concept");
