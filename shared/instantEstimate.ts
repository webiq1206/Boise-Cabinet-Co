/**
 * Which pages can send a visitor straight into one project of the P5 family
 * estimator (framed at /instant-estimate, see components/estimator).
 *
 * Only a room the estimator can price is listed. Every other room keeps its
 * "Request a quote" call to action: a visitor is never sent to an estimator
 * that cannot price their project. The project ids are the estimator's own
 * (brand "cabinet"); this site holds no questions and no pricing for them.
 */
import { INSTANT_ESTIMATE_HREF } from "./ctaCopy";

/** This site's id in the family estimator. */
export const ESTIMATOR_BRAND_ID = "cabinet";

/** The estimator projects offered to this brand. */
export const ESTIMATOR_PROJECT_IDS = ["kitchen-cabinets", "bathroom-vanity", "cabinet-refresh", "built-ins"] as const;
export type EstimatorProjectId = (typeof ESTIMATOR_PROJECT_IDS)[number];

/** Room slug (shared/catalog/roomCategories.ts) to estimator project. */
export const ROOM_ESTIMATOR_PROJECT: Readonly<Record<string, EstimatorProjectId>> = {
  kitchen: "kitchen-cabinets",
  bathroom: "bathroom-vanity",
  "built-ins": "built-ins",
  entertainment: "built-ins",
  "home-office": "built-ins",
  mudroom: "built-ins",
};

/** The estimator project for a room page, or null when the estimator cannot price that room. */
export function estimatorProjectForRoom(roomSlug: string): EstimatorProjectId | null {
  return Object.prototype.hasOwnProperty.call(ROOM_ESTIMATOR_PROJECT, roomSlug) ? ROOM_ESTIMATOR_PROJECT[roomSlug] : null;
}

/** The same shape the estimator accepts for a project id. */
export const ESTIMATOR_PROJECT_PATTERN = /^[a-z0-9-]{1,40}$/;

/** /instant-estimate, opened on one project when a valid id is given. */
export function instantEstimateHref(project?: string | null): string {
  return project && ESTIMATOR_PROJECT_PATTERN.test(project) ? `${INSTANT_ESTIMATE_HREF}?project=${project}` : INSTANT_ESTIMATE_HREF;
}
