import { CATALOG_CONTENT } from "@/shared/catalog/generated/content";
import { showLifetimeWarranty } from "@/shared/siteConfig";

/** Catalog strings stay intact. Public pages read these while the flag is off. */
export function publishedWarrantyHeadline(): string {
  return showLifetimeWarranty() ? CATALOG_CONTENT.warrantyHeadline : "Warranty";
}

export function publishedWarrantySummary(): string {
  return showLifetimeWarranty()
    ? CATALOG_CONTENT.warrantySummary
    : "Review the warranty terms for coverage, conditions, and exclusions.";
}
