import { leads } from "@/shared/schema";
import { and, eq, type SQL } from "drizzle-orm";

export interface LeadAudienceFilter {
  leadType?: string;
  emailStatus?: string;
  pipelineStage?: string;
  source?: string;
  serviceArea?: string;
  leadGroup?: string;
  emailable?: boolean | string;
}

// Builds the set of SQL conditions for an audience filter (shared by the engine,
// compose pre-send counts, and run targeting). Does NOT add emailable/suppression
// gates; the engine applies those itself so it can count skipped separately.
export function buildLeadConditions(filter: LeadAudienceFilter | null | undefined): SQL[] {
  const conditions: SQL[] = [];
  if (!filter) return conditions;
  if (filter.leadType) conditions.push(eq(leads.leadType, filter.leadType));
  if (filter.emailStatus) conditions.push(eq(leads.emailStatus, filter.emailStatus));
  if (filter.pipelineStage) conditions.push(eq(leads.pipelineStage, filter.pipelineStage));
  if (filter.source) conditions.push(eq(leads.source, filter.source));
  if (filter.serviceArea) conditions.push(eq(leads.serviceArea, filter.serviceArea));
  if (filter.leadGroup) conditions.push(eq(leads.leadGroup, filter.leadGroup));
  if (filter.emailable === true || filter.emailable === "true") conditions.push(eq(leads.emailable, true));
  if (filter.emailable === false || filter.emailable === "false") conditions.push(eq(leads.emailable, false));
  return conditions;
}

export function combineConditions(conditions: SQL[]): SQL | undefined {
  return conditions.length > 0 ? and(...conditions) : undefined;
}
