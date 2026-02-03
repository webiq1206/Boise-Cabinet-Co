"use client";

import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  company?: string | null;
  role: string;
  profileImageUrl?: string | null;
  agreementAccepted?: boolean | null;
  agreementAcceptedAt?: string | Date | null;
  watchedLeads?: string[] | null;
  declinedLeads?: string[] | null;
  stripeCustomerId?: string | null;
}

export function useAuth() {
  const { data: user, isLoading, isError, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Not authenticated");
        }
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    isError,
    error,
    refetch,
    isAdmin: user?.role === "admin",
    isSubcontractor: user?.role === "subcontractor",
  };
}
