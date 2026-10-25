"use client";

import { SITE_CONFIG } from "@/shared/siteConfig";

/** Renders the Prefer to text sentence. The phone is an sms: link so the existing click tracker records text_clicked. */
export function PreferToTextLine({ className }: { className?: string }) {
  return (
    <span className={className} data-testid="prefer-to-text">
      Prefer to text? Text{" "}
      <a href={SITE_CONFIG.phoneSmsHref} className="underline underline-offset-2">
        {SITE_CONFIG.phone}
      </a>
      . Business hours: {SITE_CONFIG.textReplyHours}.
    </span>
  );
}
