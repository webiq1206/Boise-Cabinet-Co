/** Shared classes for the quote form (Step 1) and its follow-up panel (Step 2). */

export const PILL_CLASS =
  "flex min-h-12 cursor-pointer items-center justify-center border border-foreground/45 px-1.5 text-center text-[0.9375rem] font-medium sm:px-2 sm:text-base text-foreground transition-colors hover:border-foreground has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background";

export const FIELD_CLASS =
  "block h-12 w-full rounded-none border border-foreground/40 bg-foreground/[0.06] px-3 text-base text-foreground placeholder:text-muted-foreground/80 hover:border-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive disabled:opacity-60";

export const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-foreground";

export const ERROR_CLASS = "mt-1.5 text-sm leading-snug text-destructive";

export const OUTLINE_ACTION_CLASS =
  "flex min-h-12 w-full items-center justify-center gap-2 border border-foreground/45 px-3 text-base font-semibold text-foreground transition-colors hover:border-foreground hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
