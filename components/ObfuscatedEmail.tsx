"use client";

import { Mail } from "lucide-react";

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
  label,
}: ObfuscatedEmailProps) {
  const handleClick = () => {
    window.location.href = `mailto:${user}@${domain}`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={`Email ${user} at ${domain}`}
    >
      {showIcon && <Mail className={iconClassName} />}
      <span>{label || `${user}\u0040${domain}`}</span>
    </button>
  );
}
