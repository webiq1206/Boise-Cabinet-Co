import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Consistent one-line page description shown directly under the shell header
 * title across every admin page.
 */
export function AdminPageIntro({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}
