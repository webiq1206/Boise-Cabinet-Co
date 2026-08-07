"use client";

import { Mail } from "lucide-react";
import { track } from "@/lib/analytics/track";

interface ObfuscatedEmailProps {
  user: string;
  domain: string;
  className?: string;
  iconClassName?: string;
  showIcon?: boolean;
  label?: string;
}

export function ObfuscatedEmail({
  user,
  domain,
  className = "",
  iconClassName = "h-4 w-4",
  showIcon = true,
  label = "Email us",
}: ObfuscatedEmailProps) {
  const handleClick = () => {
    track("email_clicked");
    window.location.href = `mailto:${user}@${domain}`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={`${label} at ${user}@${domain}`}
    >
      {showIcon && <Mail className={iconClassName} />}
      <span>{label}</span>
    </button>
  );
}
