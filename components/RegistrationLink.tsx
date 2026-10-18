import type { ReactNode } from "react";
import { DOPL_LICENSE_SEARCH_URL, IDAHO_REGISTERED_CONTRACTOR } from "@/shared/trustFlags";

export const DOPL_LINK_TITLE = "Look up registration 8381215 on Idaho DOPL";
export const DOPL_LINK_ARIA_LABEL =
  "Verify with Idaho DOPL: look up registration 8381215, opens in a new tab";

/** Footer and the about credential line. The number stays plain text. */
export function RegistrationLink({ className }: { className?: string }) {
  return (
    <span>
      {IDAHO_REGISTERED_CONTRACTOR}
      {" · "}
      <a
        href={DOPL_LICENSE_SEARCH_URL}
        target="_blank"
        rel="noopener noreferrer"
        title={DOPL_LINK_TITLE}
        aria-label={DOPL_LINK_ARIA_LABEL}
        className={className}
      >
        Verify with Idaho DOPL
      </a>
    </span>
  );
}

/** FAQ, meta, and schema keep the registration phrase as plain text. */
export function linkifyRegistration(text: string, className?: string): ReactNode {
  void className;
  return text;
}
