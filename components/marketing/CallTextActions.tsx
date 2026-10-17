/** Tap-to-call and tap-to-text for landing heroes. Labels and hours are Priya rev 2. */
export const CALL_NOW_HREF = "tel:+12084771169";
export const TEXT_US_HREF = "sms:+12084771169";
export const CALL_TEXT_HOURS = "Call or text Mon to Fri 9 to 6, Sat 9 to 4 MT";

const linkClass =
  "inline-flex min-h-12 flex-1 items-center justify-center border border-inverse-foreground/40 px-4 text-sm font-medium text-inverse-foreground";

export function CallTextActions() {
  return (
    <div data-call-text-actions="">
      <div className="flex gap-2">
        <a href={CALL_NOW_HREF} className={linkClass}>
          Call now
        </a>
        <a href={TEXT_US_HREF} className={linkClass}>
          Text us
        </a>
      </div>
      <p className="mt-2 text-sm text-inverse-foreground/80">{CALL_TEXT_HOURS}</p>
    </div>
  );
}
