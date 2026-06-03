"use client";

import { type ReactNode } from "react";
import { PortalNavProvider } from "@/components/portal/PortalNavProvider";
import { PortalAuthGate } from "@/components/portal/PortalAuthGate";

export function PortalLayoutClient({ children }: { children: ReactNode }) {
  return (
    <PortalNavProvider>
      <PortalAuthGate role="customer">{children}</PortalAuthGate>
    </PortalNavProvider>
  );
}
