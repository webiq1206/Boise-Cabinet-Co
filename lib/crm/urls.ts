import { SITE_CONFIG } from "@/shared/siteConfig";

function base(): string {
  return SITE_CONFIG.siteUrl.replace(/\/$/, "");
}

// One-click unsubscribe by lead unsubscribeToken (unified across runs/sequences).
export function buildUnsubscribeUrl(token: string): string {
  return `${base()}/api/outreach/unsubscribe?token=${encodeURIComponent(token)}`;
}

// Open pixel keyed by the per-send tracking token.
export function buildOpenPixelUrl(sendToken: string): string {
  return `${base()}/api/outreach/open?send=${encodeURIComponent(sendToken)}`;
}

// Click redirect that records the click then 302s to the real URL.
export function buildClickUrl(sendToken: string, url: string): string {
  return `${base()}/api/track/click?send=${encodeURIComponent(sendToken)}&u=${encodeURIComponent(url)}`;
}
