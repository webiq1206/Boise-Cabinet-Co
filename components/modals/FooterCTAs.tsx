"use client";

import { usePathname } from "next/navigation";
import { useModals } from "./ModalProvider";
import { CTA_CONSULT, CTA_ESTIMATE } from "@/shared/ctaCopy";

const cls =
  "text-sm text-inverse-muted hover:text-inverse-foreground transition-colors text-left";

export function FooterCTAs() {
  const { openConsult, openEstimate } = useModals();
  const isHome = usePathname() === "/";

  return (
    <>
      <li>
        {isHome ? (
          <a href="/#consult" className={cls}>
            {CTA_CONSULT}
          </a>
        ) : (
          <button onClick={openConsult} className={cls}>
            {CTA_CONSULT}
          </button>
        )}
      </li>
      <li>
        {isHome ? (
          <a href="/#calculator" className={cls}>
            {CTA_ESTIMATE}
          </a>
        ) : (
          <button onClick={openEstimate} className={cls}>
            {CTA_ESTIMATE}
          </button>
        )}
      </li>
    </>
  );
}
