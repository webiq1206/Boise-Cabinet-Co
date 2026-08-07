import { z } from "zod";
import {
  PROJECT_PRICING,
  type EstimateSelections,
  type ProjectType,
} from "./estimateEngine";

/**
 * Zod schema for raw estimator selections crossing an API boundary.
 *
 * Shared by the calculate API and the estimating assistant's tools so every
 * surface admits exactly the same inputs. Values are validated for type/bounds
 * only - the engine's own normalizeSelections() remains responsible for
 * clamping sizes and falling back on unknown layouts, exactly as it does for
 * the wizard, so both paths stay numerically identical.
 */

export const PROJECT_TYPE_VALUES = Object.keys(PROJECT_PRICING) as [
  ProjectType,
  ...ProjectType[],
];

/** Generous absolute bound on any linear-footage input; engine clamps tighter. */
const MAX_LF = 1000;

export const roomSelectionsSchema = z.object({
  project: z.enum(PROJECT_TYPE_VALUES).nullable(),
  layout: z.string().max(60).default(""),
  size: z.number().finite().min(0).max(MAX_LF).nullable().default(null),
  sizeUpper: z.number().finite().min(0).max(MAX_LF).nullable().default(null),
  doorStyle: z.string().max(60).default(""),
  finishSlug: z.string().max(80).default(""),
  finishCategory: z.enum(["matte", "woodgrain", "gloss"]).or(z.literal("")).default(""),
  finishTier: z.enum(["standard", "premium", "reserve"]).or(z.literal("")).default(""),
  construction: z.enum(["good", "better", "best"]).or(z.literal("")).default(""),
}) satisfies z.ZodType<EstimateSelections, z.ZodTypeDef, unknown>;

/** A visitor plans at most a handful of rooms in one pass. */
export const MAX_ROOMS = 10;

export const roomsArraySchema = z.array(roomSelectionsSchema).min(1).max(MAX_ROOMS);
