"use client";

import { SITE_CONFIG } from "@/shared/siteConfig";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";

const atIndex = SITE_CONFIG.email.indexOf("@");
const EMAIL_USER = SITE_CONFIG.email.slice(0, atIndex);
const EMAIL_DOMAIN = SITE_CONFIG.email.slice(atIndex + 1);

interface SiteEmailLinkProps {
  className?: string;
  showIcon?: boolean;
  label?: string;
}

/** Obfuscated site contact email — no plaintext address in SSR HTML. */
export function SiteEmailLink({
  className = "",
  showIcon = false,
  label = "Email us",
}: SiteEmailLinkProps) {
  return (
    <ObfuscatedEmail
      user={EMAIL_USER}
      domain={EMAIL_DOMAIN}
      label={label}
      showIcon={showIcon}
      className={className}
    />
  );
}
