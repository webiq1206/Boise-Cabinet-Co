import { SITE_CONFIG } from "@/shared/siteConfig";

/**
 * Real phone links, rendered by the server so the first HTML response already
 * contains them. Visible labels stay short so the row fits a 360px screen.
 */
export function AboveFoldActions() {
  return (
    <div className="above-fold-actions" data-above-fold-actions="">
      <a href={SITE_CONFIG.phoneHref} aria-label={`Call ${SITE_CONFIG.phone}`}>
        Call
      </a>
      <a href={SITE_CONFIG.phoneSmsHref} aria-label={`Text ${SITE_CONFIG.phone}`}>
        Text
      </a>
    </div>
  );
}
