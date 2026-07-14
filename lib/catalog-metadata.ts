import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_CONFIG } from "@/shared/siteConfig";

/** Catalog page metadata with Boise Cabinet Co branding */
export function catalogMetadata(
  path: string,
  title: string,
  description: string,
  opts?: { noindex?: boolean; ogImage?: { url: string; width: number; height: number; alt: string } },
): Metadata {
  return buildPageMetadata({
    kind: "about",
    path,
    titleOverride: title.replace(/\s*[|–-]\s*\{company\}/g, '').replace(/\{company\}/g, SITE_CONFIG.name).trim(),
    descriptionOverride: description.replace(
      /\{company\}/g,
      SITE_CONFIG.name,
    ),
    noindex: opts?.noindex,
    ogImage: opts?.ogImage,
  });
}

export function catalogDescription(text: string): string {
  return text.replace(/\{company\}/g, SITE_CONFIG.name);
}
