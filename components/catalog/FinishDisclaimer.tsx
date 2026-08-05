import { cn } from "@/lib/utils";

/**
 * Finish and color accuracy disclaimer. Required anywhere finish swatches or
 * color photography are presented, because screens, lighting, and printing all
 * shift how a color reads and natural materials carry expected variation.
 */
export function FinishDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      Finish swatches and photography are a guide only. Screen and device
      settings, lighting, and printing can shift how a color reads, and wood and
      other natural materials carry expected grain and tone variation. Review
      physical samples in your home before finalizing a selection.
    </p>
  );
}
