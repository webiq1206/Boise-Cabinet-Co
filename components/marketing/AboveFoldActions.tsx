import { SITE_CONFIG } from "@/shared/siteConfig";

/**
 * Real phone links, rendered by the server so the first HTML response already
 * contains them. Styled as one quiet secondary line ("Call · Text (208) 477-1169")
 * so a hero carries one primary action plus at most one secondary.
 */
export function AboveFoldActions() {
  return (
    <div className="above-fold-actions" data-above-fold-actions="">
      <a href={SITE_CONFIG.phoneHref} aria-label={`Call ${SITE_CONFIG.phone}`}>
        Call
      </a>
      <span aria-hidden="true">·</span>
      <a href={SITE_CONFIG.phoneSmsHref} aria-label={`Text ${SITE_CONFIG.phone}`}>
        Text
      </a>
      <span className="above-fold-phone">{SITE_CONFIG.phone}</span>
    </div>
  );
}
