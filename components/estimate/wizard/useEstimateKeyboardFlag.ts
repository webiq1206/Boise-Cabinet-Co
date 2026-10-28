"use client";

import { useEffect } from "react";

/**
 * Marks the document while a real text field is focused so `useKeyboardInset`
 * can apply the Chromium phone-sim fallback when visualViewport does not shrink.
 */
export function useEstimateKeyboardFlag(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input:not([type=hidden]):not([tabindex='-1']), textarea")) {
        document.body.dataset.estimateKeyboard = "true";
      }
    };
    const onFocusOut = () => {
      window.setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        if (!active?.matches("input:not([type=hidden]):not([tabindex='-1']), textarea")) {
          delete document.body.dataset.estimateKeyboard;
        }
      }, 0);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      delete document.body.dataset.estimateKeyboard;
    };
  }, [enabled]);
}
