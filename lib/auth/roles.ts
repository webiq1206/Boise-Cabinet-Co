import type { User } from "@/shared/schema";

export type UserRole = "admin" | "partner" | "customer";

/** Legacy alias — subcontractor maps to partner */
export function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) return null;
  if (role === "admin") return "admin";
  if (role === "subcontractor" || role === "partner") return "partner";
  if (role === "customer") return "customer";
  return null;
}

export function isAdmin(user: Pick<User, "role"> | null | undefined): boolean {
  return normalizeRole(user?.role) === "admin";
}

export function isPartner(user: Pick<User, "role"> | null | undefined): boolean {
  return normalizeRole(user?.role) === "partner";
}

export function isCustomer(user: Pick<User, "role"> | null | undefined): boolean {
  return normalizeRole(user?.role) === "customer";
}

export function getPortalHomePath(role: UserRole | null): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "partner":
      return "/partner";
    case "customer":
      return "/portal";
    default:
      return "/";
  }
}
