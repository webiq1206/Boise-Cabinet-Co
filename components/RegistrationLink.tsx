import { Fragment, type ReactNode } from "react";
import { DOPL_LICENSE_SEARCH_URL, IDAHO_REGISTERED_CONTRACTOR } from "@/shared/trustFlags";

export function RegistrationLink({ className }: { className?: string }) {
  return (
    <a
      href={DOPL_LICENSE_SEARCH_URL}
      target="_blank"
      rel="noopener"
      className={className}
    >
      {IDAHO_REGISTERED_CONTRACTOR}
    </a>
  );
}

/** Turn the registration phrase into the DOPL search link. Other text stays plain. */
export function linkifyRegistration(text: string, className?: string): ReactNode {
  if (!text.includes(IDAHO_REGISTERED_CONTRACTOR)) return text;
  const parts = text.split(IDAHO_REGISTERED_CONTRACTOR);
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 ? <RegistrationLink className={className} /> : null}
    </Fragment>
  ));
}
