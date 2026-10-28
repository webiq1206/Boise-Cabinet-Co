/**
 * Ref-counted control for the global mobile Call/Text bar.
 *
 * Multiple surfaces may want the bar hidden at the same time. Each caller
 * requests a hide and gets an idempotent release; the bar is revealed only
 * once every request is released.
 */
let count = 0;

export function requestHideMobileNavBar(): () => void {
  count += 1;
  if (typeof document !== "undefined") {
    document.body.dataset.hideMobileNavBar = "true";
  }
  // Same signal GuidedFlowShell uses so Navigation / Assistant step aside.
  if (typeof window !== "undefined") {
    const w = window as unknown as { __wizardMobileBars?: number };
    w.__wizardMobileBars = (w.__wizardMobileBars ?? 0) + 1;
    window.dispatchEvent(new Event("wizardmobilebar"));
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    count = Math.max(0, count - 1);
    if (count === 0 && typeof document !== "undefined") {
      delete document.body.dataset.hideMobileNavBar;
    }
    if (typeof window !== "undefined") {
      const w = window as unknown as { __wizardMobileBars?: number };
      w.__wizardMobileBars = Math.max(0, (w.__wizardMobileBars ?? 1) - 1);
      window.dispatchEvent(new Event("wizardmobilebar"));
    }
  };
}
