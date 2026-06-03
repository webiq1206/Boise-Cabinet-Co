"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface PortalNavContextValue {
  activeProjectId: string | null;
  isLoading: boolean;
}

const PortalNavContext = createContext<PortalNavContextValue>({
  activeProjectId: null,
  isLoading: true,
});

export function PortalNavProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery<{ activeProject?: { id: string } | null }>({
    queryKey: ["/api/portal/dashboard"],
    queryFn: () => fetch("/api/portal/dashboard").then((r) => r.json()),
    staleTime: 60_000,
  });

  return (
    <PortalNavContext.Provider
      value={{
        activeProjectId: data?.activeProject?.id ?? null,
        isLoading,
      }}
    >
      {children}
    </PortalNavContext.Provider>
  );
}

export function usePortalNav() {
  return useContext(PortalNavContext);
}
