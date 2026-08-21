"use client";

import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Contextual "why it matters" helper. Uses a tap-friendly popover (works on
 * touch where hover tooltips do not) with an accessible label.
 */
export function HelpHint({
  children,
  label = "More info",
  className,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
          data-testid="help-hint-trigger"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 text-base leading-relaxed"
        data-testid="help-hint-content"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
