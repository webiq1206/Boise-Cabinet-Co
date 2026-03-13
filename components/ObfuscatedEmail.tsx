"use client";

import { useState, useEffect } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    window.location.href = `mailto:${user}@${domain}`;
  };

  const displayText = label || (mounted ? `${user}@${domain}` : "Contact us by email");

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label="Send us an email"
    >
      {showIcon && <Mail className={iconClassName} />}
      <span>{displayText}</span>
    </button>
  );
}
