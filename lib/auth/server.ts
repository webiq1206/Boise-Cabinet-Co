import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/shared/schema";
import { normalizeRole, type UserRole } from "@/lib/auth/roles";

export async function requireAuth(): Promise<
  { user: User; error: null } | { user: null; error: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export async function requireRole(
  allowed: UserRole | UserRole[],
): Promise<{ user: User; error: null } | { user: null; error: NextResponse }> {
  const auth = await requireAuth();
  if (auth.error) return auth;

  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  const userRole = normalizeRole(auth.user.role);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return auth;
}
