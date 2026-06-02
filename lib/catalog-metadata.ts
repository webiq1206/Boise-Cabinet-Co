import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_CONFIG } from "@/shared/siteConfig";

/** Catalog page metadata with Boise Cabinet Co branding */
export function catalogMetadata(
  path: string,
  title: string,
  description: string,
): Metadata {
  return buildPageMetadata({
    kind: "about",
    path,
    titleOverride: title,
    descriptionOverride: description.replace(
      /\{company\}/g,
      SITE_CONFIG.name,
    ),
  });
}

export function catalogDescription(text: string): string {
  return text.replace(/\{company\}/g, SITE_CONFIG.name);
}
