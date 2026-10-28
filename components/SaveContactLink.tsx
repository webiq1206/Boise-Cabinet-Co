import { Contact } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUSINESS_VCARD_PATH } from "@/lib/vcard";
import { CTA_SAVE_CONTACT } from "@/shared/ctaCopy";

interface SaveContactLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  /** When true, show the contact-card icon before the label. */
  showIcon?: boolean;
  children?: React.ReactNode;
}

/**
 * Link to the business vCard. On iPhone Safari, tapping opens Contacts with
 * "Add to Contacts". Phase 11: Save our contact.
 */
export function SaveContactLink({
  className,
  showIcon = false,
  children = CTA_SAVE_CONTACT,
  ...props
}: SaveContactLinkProps) {
  return (
    <a
      href={BUSINESS_VCARD_PATH}
      download
      className={cn(showIcon && "inline-flex items-center gap-1.5", className)}
      data-testid="link-save-contact"
      data-analytics-event="save_contact"
      {...props}
    >
      {showIcon && <Contact className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} aria-hidden />}
      {children}
    </a>
  );
}
