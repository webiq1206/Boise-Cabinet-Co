"use client";

import { usePathname } from "next/navigation";
import { useModals } from "./ModalProvider";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";

const cls =
  "text-sm text-inverse-muted hover:text-inverse-foreground transition-colors text-left";

export function FooterCTAs() {
  const { openEstimate } = useModals();
  const isHome = usePathname() === "/";

  return (
    <>
      <li>
        {isHome ? (
          <a href="/#calculator" className={cls}>
            {CTA_ESTIMATE}
          </a>
        ) : (
          <button type="button" onClick={openEstimate} className={cls}>
            {CTA_ESTIMATE}
          </button>
        )}
      </li>
    </>
  );
}
