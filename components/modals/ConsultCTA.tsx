"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { useModals } from "./ModalProvider";

interface ConsultCTAProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  onExtraClick?: () => void;
}

export function ConsultCTA({ onExtraClick, children, ...props }: ConsultCTAProps) {
  const { openConsult } = useModals();
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/contact") {
    const href = pathname === "/" ? "/#consult" : "/contact#consult";
    return (
      <Button {...props} asChild>
        <a href={href} onClick={onExtraClick}>
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button
      {...props}
      onClick={() => {
        openConsult();
        onExtraClick?.();
      }}
    >
      {children}
    </Button>
  );
}
