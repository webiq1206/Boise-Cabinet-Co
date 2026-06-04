import { getIronSession, SessionOptions, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { normalizeRole, getPortalHomePath } from "@/lib/auth/roles";

const scrypt = promisify(scryptCb);

export interface SessionData {
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  claims?: {
    sub: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
  };
  returnTo?: string;
  codeVerifier?: string;
  state?: string;
}

function getSessionPassword(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long");
  }
  return secret;
}

function getSessionOptions(): SessionOptions {
  return {
    password: getSessionPassword(),
    cookieName: "brc_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60,
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

export async function getValidatedSession() {
  const session = await getSession();
  
  if (!session.userId) {
    return null;
  }

  if (session.expiresAt && session.expiresAt < Date.now() / 1000) {
    session.destroy();
    return null;
  }

  return session;
}

const SCRYPT_KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, SCRYPT_KEYLEN)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hashHex] = stored.split(":");
  const hashBuf = Buffer.from(hashHex, "hex");
  const derived = (await scrypt(password, salt, hashBuf.length)) as Buffer;
  if (derived.length !== hashBuf.length) return false;
  return timingSafeEqual(derived, hashBuf);
}

function getExternalProtocol(request: { headers: { get(name: string): string | null } }) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) return forwardedProto.split(",")[0].trim();
  return process.env.NODE_ENV === "production" ? "https" : "http";
}

export function getExternalHostname(request: { headers: { get(name: string): string | null }, url?: string }) {
  return request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:5000";
}

export function getExternalBaseUrl(request: { headers: { get(name: string): string | null }, url?: string }) {
  const protocol = getExternalProtocol(request);
  const hostname = getExternalHostname(request);
  return `${protocol}://${hostname}`;
}

export function getExternalUrl(request: { headers: { get(name: string): string | null }, url?: string }, path: string) {
  return `${getExternalBaseUrl(request)}${path}`;
}

export function getRedirectUri(hostname: string, requestUrl?: string) {
  if (requestUrl) {
    const url = new URL(requestUrl);
    return `${url.protocol}//${hostname}/api/callback`;
  }
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${hostname}/api/callback`;
}

export function getBaseUrl(hostname: string, requestUrl?: string) {
  if (requestUrl) {
    const url = new URL(requestUrl);
    return `${url.protocol}//${hostname}`;
  }
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${hostname}`;
}

export async function getUserFromDb(userId: string) {
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] || null;
}

const ADMIN_EMAILS = [
  "hello@boisecabinet.co",
];

/** Partner emails can be extended via env or admin assignment */
const PARTNER_EMAILS: string[] = (
  process.env.PARTNER_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? []
).filter(Boolean);

export type AppRole = "admin" | "partner" | "customer" | "subcontractor";

function getDesignatedRole(
  email: string | undefined,
  existingRole?: string | null,
): AppRole {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return "admin";
  }
  if (email && PARTNER_EMAILS.includes(email.toLowerCase())) {
    return "partner";
  }
  if (existingRole === "customer") return "customer";
  if (existingRole === "partner" || existingRole === "subcontractor") return "partner";
  // Default new OIDC users without project link remain partners for legacy marketplace;
  // customer role assigned via invite or project linking
  return "subcontractor";
}

export async function upsertUserFromClaims(claims: SessionData["claims"]) {
  if (!db || !claims?.sub) return null;

  const existing = await getUserFromDb(claims.sub);
  const designatedRole = getDesignatedRole(claims.email, existing?.role);

  if (existing) {
    const updateData: Record<string, any> = {
      email: claims.email || existing.email,
      firstName: claims.first_name || existing.firstName,
      lastName: claims.last_name || existing.lastName,
      profileImageUrl: claims.profile_image_url || existing.profileImageUrl,
    };

    if (existing.role !== designatedRole && designatedRole === "admin") {
      updateData.role = "admin";
      console.log(`[AUTH] Upgrading user ${claims.sub} (${claims.email}) from ${existing.role} to admin`);
    } else if (existing.role === "customer" && designatedRole !== "admin") {
      // Preserve customer role unless upgrading to admin
      updateData.role = "customer";
    }

    await db.update(users).set(updateData).where(eq(users.id, claims.sub));
    return getUserFromDb(claims.sub);
  }

  await db.insert(users).values({
    id: claims.sub,
    email: claims.email,
    firstName: claims.first_name,
    lastName: claims.last_name,
    profileImageUrl: claims.profile_image_url,
    role: designatedRole,
  });

  console.log(`[AUTH] Created new user ${claims.sub} (${claims.email}) with role: ${designatedRole}`);
  return getUserFromDb(claims.sub);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session.userId) {
    return null;
  }

  if (session.expiresAt && session.expiresAt < Date.now() / 1000) {
    session.destroy();
    return null;
  }

  const user = await getUserFromDb(session.userId);
  return user;
}

export function sanitizeUser<T extends Record<string, unknown>>(
  user: T,
): Omit<T, "passwordHash"> {
  const { passwordHash: _omit, ...rest } = user as T & { passwordHash?: unknown };
  return rest;
}

export async function getUserByEmail(email: string) {
  if (!db) return null;
  const normalized = email.trim().toLowerCase();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  return result[0] || null;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export async function establishSession(
  session: IronSession<SessionData>,
  user: {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
  },
) {
  session.userId = user.id;
  session.expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  session.claims = {
    sub: user.id,
    email: user.email ?? undefined,
    first_name: user.firstName ?? undefined,
    last_name: user.lastName ?? undefined,
    profile_image_url: user.profileImageUrl ?? undefined,
  };
  delete session.codeVerifier;
  delete session.state;
  delete session.accessToken;
  delete session.refreshToken;
  await session.save();
}

export async function registerUser(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  if (!db) throw new AuthError("Database unavailable", 500);
  const email = input.email.trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new AuthError("An account with this email already exists.", 409);
  }
  const passwordHash = await hashPassword(input.password);
  // Never grant admin via unverified password registration. Email ownership is
  // not proven here, so an admin-designated email must not self-promote. Admin is
  // granted only through the verified OIDC login flow or a manual DB promotion.
  const designated = getDesignatedRole(email, null);
  const role = designated === "admin" ? "subcontractor" : designated;
  const inserted = await db
    .insert(users)
    .values({
      email,
      firstName: input.firstName?.trim() || null,
      lastName: input.lastName?.trim() || null,
      role,
      passwordHash,
    })
    .returning();
  return inserted[0];
}

export async function loginUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) {
    throw new AuthError("Invalid email or password.", 401);
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new AuthError("Invalid email or password.", 401);

  // Do NOT auto-promote to admin on password login: email ownership is not
  // verified here. Admin is granted only via the verified OIDC login flow
  // (upsertUserFromClaims) or a manual DB promotion. Partner promotion by email
  // is non-privileged and preserved for the legacy marketplace flow.
  const designated = getDesignatedRole(user.email ?? undefined, user.role);
  if (designated === "partner" && user.role !== "partner" && user.role !== "admin" && db) {
    await db.update(users).set({ role: "partner" }).where(eq(users.id, user.id));
    return { ...user, role: "partner" };
  }
  return user;
}

export function resolveLoginRedirect(
  user: { role?: string | null } | null,
  returnTo?: string | null,
): string {
  const safeReturnTo =
    typeof returnTo === "string" && returnTo.startsWith("/") ? returnTo : null;
  const role = normalizeRole(user?.role);

  if (safeReturnTo?.startsWith("/admin") && role !== "admin") return "/admin";
  if (
    safeReturnTo?.startsWith("/portal") &&
    role !== "customer" &&
    role !== "admin"
  ) {
    return getPortalHomePath(role);
  }
  if (role === "admin") return safeReturnTo || "/admin/dashboard";
  if (role === "partner") return safeReturnTo || "/partner";
  if (role === "customer") return safeReturnTo || "/portal";
  return safeReturnTo || "/";
}
