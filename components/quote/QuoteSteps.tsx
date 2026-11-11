import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The two steps, always in view: step 1 is the request itself (the only part
 * anyone has to complete), step 2 is optional photos and details. Once the
 * request is saved, step 1 reads "Request sent" with a tick, so nobody is left
 * wondering whether the extra questions are still part of sending it.
 */
export function QuoteSteps({ sent }: { sent: boolean }) {
  const badge = "flex h-6 w-6 flex-none items-center justify-center border text-xs font-semibold";
  return (
    <ol className="flex flex-col gap-x-3 gap-y-1.5 text-sm sm:flex-row sm:flex-wrap sm:items-center" data-quote-steps="" data-quote-sent={sent ? "true" : "false"}>
      <li
        aria-current={sent ? undefined : "step"}
        className="flex items-center gap-2 font-medium text-foreground"
      >
        <span className={cn(badge, "border-foreground bg-foreground text-background")} aria-hidden="true">
          {sent ? <Check className="h-3.5 w-3.5" /> : "1"}
        </span>
        <span>
          <span className="sr-only">Step 1: </span>
          {sent ? "Request sent" : "Your request"}
        </span>
      </li>
      <li
        aria-current={sent ? "step" : undefined}
        className={cn("flex items-center gap-2", sent ? "font-medium text-foreground" : "text-muted-foreground")}
      >
        <span className="hidden h-px w-5 bg-foreground/30 sm:block" aria-hidden="true" />
        <span className={cn(badge, sent ? "border-foreground" : "border-foreground/40")} aria-hidden="true">
          2
        </span>
        <span>
          <span className="sr-only">Step 2: </span>
          Photos and details (optional)
        </span>
      </li>
    </ol>
  );
}
