/** Shared classes for the quote form (Step 1) and its follow-up panel (Step 2). */

export const PILL_CLASS =
  "flex min-h-12 cursor-pointer items-center justify-center border border-foreground/45 px-1.5 text-center text-[0.9375rem] font-medium sm:px-2 sm:text-base text-foreground transition-colors hover:border-foreground has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background";

export const FIELD_CLASS =
  "block h-12 w-full rounded-none border border-foreground/40 bg-foreground/[0.06] px-3 text-base text-foreground placeholder:text-muted-foreground/80 hover:border-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive disabled:opacity-60";

export const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-foreground";

export const ERROR_CLASS = "mt-1.5 text-sm leading-snug text-destructive";

export const OUTLINE_ACTION_CLASS =
  "flex min-h-12 w-full items-center justify-center gap-2 border border-foreground/45 px-3 text-base font-semibold text-foreground transition-colors hover:border-foreground hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * The one quiet toggle that holds everything optional: a native details whose
 * summary is a single line of muted text with a small plus. No border, no
 * background and no panel; opened, its fields sit in the normal field flow.
 */
export const QUIET_TOGGLE_CLASS = "group";

export const QUIET_SUMMARY_CLASS =
  "flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden";

/** The small plus beside a quiet toggle; it turns to a cross while the toggle is open. */
export const QUIET_PLUS_CLASS = "h-4 w-4 flex-none transition-transform group-open:rotate-45";

/** The one muted small text style under the fields. */
export const MUTED_LINE_CLASS = "text-sm leading-relaxed text-muted-foreground";

/** A text link inside a muted line. */
export const MUTED_LINK_CLASS = "font-medium text-foreground underline underline-offset-4 hover:no-underline";
