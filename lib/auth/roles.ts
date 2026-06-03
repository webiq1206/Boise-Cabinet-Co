import type { User } from "@/shared/schema";

export type UserRole = "admin" | "partner" | "customer" | "dealer" | "installer";

/** Legacy alias; dealer/installer/subcontractor map to partner for permissions */
export function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) return null;
  if (role === "admin") return "admin";
  if (
    role === "subcontractor" ||
    role === "partner" ||
    role === "dealer" ||
    role === "installer"
  ) {
    return role === "dealer" || role === "installer" ? role : "partner";
  }
  if (role === "customer") return "customer";
  return null;
}

export function isDealer(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "dealer";
}

export function isInstaller(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "installer";
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
    case "dealer":
      return "/dealer";
    case "installer":
      return "/installer";
    case "customer":
      return "/portal";
    default:
      return "/";
  }
}
