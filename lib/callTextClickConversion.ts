import { track } from "@/lib/analytics/track";

/**
 * Tap-to-call and tap-to-text conversions. These labels are click events.
 * They are separate from the website-call forwarding number configured in
 * googleTagBootstrap.
 */
export const GOOGLE_ADS_TEL_CLICK_LABEL = "AW-18354188204/ng9fCPiOhaAdEKzf-q9E";
export const GOOGLE_ADS_SMS_CLICK_LABEL = "AW-18354188204/lTxsCOqahaAdEKzf-q9E";

const LIVE_HOST = "boisecabinet.co";

type GtagFn = (...args: unknown[]) => void;

/**
 * Same visitor gate as googleTagBootstrap: live hostname, not an automated
 * browser, and not an explicit QA session. A missing gtag means the tag was
 * not installed, so the click is not a conversion.
 */
export function callTextClickAnalyticsAllowed(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  if (host !== LIVE_HOST && host !== `www.${LIVE_HOST}`) return false;
  if (navigator.webdriver === true) return false;
  try {
    if (sessionStorage.getItem("p5_analytics_disabled") === "1") return false;
  } catch {
    /* Unavailable storage does not block a real visitor, matching the tag bootstrap. */
  }
  return typeof (window as { gtag?: unknown }).gtag === "function";
}

export function trackCallTextClickConversion(href: string): boolean {
  if (!callTextClickAnalyticsAllowed()) return false;
  const value = href || "";
  const sendTo = value.startsWith("tel:")
    ? GOOGLE_ADS_TEL_CLICK_LABEL
    : value.startsWith("sms:")
      ? GOOGLE_ADS_SMS_CLICK_LABEL
      : null;
  if (!sendTo) return false;
  const gtag = (window as unknown as { gtag: GtagFn }).gtag;
  gtag("event", "conversion", { send_to: sendTo });
  return true;
}

let boundHandler: ((event: Event) => void) | null = null;

/**
 * One document click listener for GA4 contact clicks and the Ads click
 * conversions. A second call is a no-op so a repeated effect cannot stack.
 */
export function bindDelegatedContactClicks(): () => void {
  if (boundHandler) return () => {};
  const onClick = (event: Event) => {
    const link = (event.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (href.startsWith("tel:")) track("phone_clicked");
    else if (href.startsWith("sms:")) track("text_clicked");
    else if (href.startsWith("mailto:")) track("email_clicked");
    trackCallTextClickConversion(href);
  };
  boundHandler = onClick;
  document.addEventListener("click", onClick);
  return () => {
    if (boundHandler !== onClick) return;
    document.removeEventListener("click", onClick);
    boundHandler = null;
  };
}
